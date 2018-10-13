import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { injectIntl } from 'react-intl';
import { compose } from 'recompose';
import userQuery from '/app/ui/apollo-client/user/query/user';
import saveSubscriptionMutation from '/app/ui/apollo-client/user/mutation/save-subscription';
import Button from '/app/ui/components/dumb/button';

const { publicKey: vapidPublicKey } = Meteor.settings.public.vapid;

// Source: https://www.npmjs.com/package/web-push
// When using your VAPID key in your web app, you'll need to convert the URL
// safe base64 string to a Uint8Array to pass into the subscribe call, which you
// can do like so:

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/'); // eslint-disable-line

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Source: https://github.com/GoogleChrome/samples/blob/gh-pages/push-messaging-and-notifications/main.js
class SubscribeBtn extends React.PureComponent {
  handleClick = async () => {
    const {
      intl: { formatMessage: t },
      saveSubscription,
      onBeforeHook,
      onClientErrorHook,
      onServerErrorHook,
      onSuccessHook,
    } = this.props;

    // Run before logic if provided and return on error
    try {
      onBeforeHook();
    } catch (exc) {
      return; // return silently
    }

    let subscription = null;

    try {
      // We need the service worker registration to create the subscription
      const registration = await navigator.serviceWorker.ready;

      // Register subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // always show notification when received
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    } catch (exc) {
      if (Notification.permission === 'denied') {
        // The user denied the notification permission which means we failed to
        // subscribe and the user will need to manually change the notification
        // permission to subscribe to push messages
        onClientErrorHook(t({ id: 'pushPermissionDeniedError' }));
      } else {
        // A problem occurred with the subscription, this can often be down to
        // an issue or lack of the gcm_sender_id and / or gcm_user_visible_only
        const err = { reason: `${t({ id: 'pushSubscribtionFailedError' })} ${exc}` };
        onClientErrorHook(err);
        return;
      }
    }

    try {
      // Get subscription enpoint, public key and the shared secret
      const { endpoint } = subscription;
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      // Encode the public key and the shared secret (which are in bytes) into
      // base64 format to transmit over HTTP
      const encSubscription = {
        endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(p256dh))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(auth))),
        },
      };

      // Send the subscription to your server and save it to send a push message
      // at a later date.
      await saveSubscription({
        variables: { subscription: encSubscription },
        refetchQueries: [{ query: userQuery }],
      });

      onSuccessHook();
    } catch (exc) {
      onServerErrorHook(exc);
    }
  }

  render() {
    const { intl: { formatMessage: t }, btnLabel, disabled } = this.props;

    return (
      <Button
        disabled={disabled}
        onClick={this.handleClick}
      >
        {btnLabel || t({ id: 'pushEnableButton' })}
      </Button>
    );
  }
}

SubscribeBtn.propTypes = {
  btnLabel: PropTypes.string, // eslint-disable-line react/require-default-props
  disabled: PropTypes.bool,
  saveSubscription: PropTypes.func.isRequired,
  onBeforeHook: PropTypes.func,
  onClientErrorHook: PropTypes.func,
  onServerErrorHook: PropTypes.func,
  onSuccessHook: PropTypes.func,
};

SubscribeBtn.defaultProps = {
  disabled: false,
  onBeforeHook: () => {},
  onClientErrorHook: () => {},
  onServerErrorHook: () => {},
  onSuccessHook: () => {},
};

export default compose(
  injectIntl,
  graphql(saveSubscriptionMutation, { name: 'saveSubscription' }),
)(SubscribeBtn);
