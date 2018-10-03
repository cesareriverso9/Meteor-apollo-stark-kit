import React from 'react';
import { propType } from 'graphql-anywhere';
import { compose } from 'recompose';
import userFragment from '../apollo-client/user/fragment/user';
import { withPWABtnProps, withFormProps } from '../render-props';
import SEO from '../components/smart/seo';
import SubscribeBtn from '../components/smart/pwa/subscribe-btn';
import UnsubscribeBtn from '../components/smart/pwa/unsubscribe-btn';
import PushBtn from '../components/smart/pwa/push-btn';
import Feedback from '../components/dumb/feedback';
import Alert from '../components/dumb/alert';
import Loading from '../components/dumb/loading';

//------------------------------------------------------------------------------
// COMPONENT:
//------------------------------------------------------------------------------
const HomePage = ({
  curUser,
  supported,
  subscribed,
  handleSubscriptionChange,
  disabled,
  errorMsg,
  successMsg,
  handleBefore,
  handleClientError,
  handleServerError,
  handleSuccess,
}) => {
  // Display loading indicator while checking for push support
  if (supported === 'loading') {
    return <Loading />;
  }

  // Do not render subscribe and push notification buttons in case
  // notifications aren't supported
  if (!supported) {
    return (
      <Alert
        type="error"
        content="Your browser doesn't support service workers"
      />
    );
  }

  return (
    <div>
      {subscribed ? (
        <UnsubscribeBtn
          disabled={disabled}
          onBeforeHook={handleBefore}
          onServerErrorHook={handleServerError}
          onClientErrorHook={handleClientError}
          onSuccessHook={() => {
            handleSubscriptionChange({ subscribed: false });
            handleSuccess();
          }}
        />
      ) : (
        <SubscribeBtn
          disabled={disabled}
          onBeforeHook={handleBefore}
          onClientErrorHook={handleClientError}
          onServerErrorHook={handleServerError}
          onSuccessHook={() => {
            handleSubscriptionChange({ subscribed: true });
            handleSuccess();
          }}
        />
      )}
      <div className="my1" />
      {subscribed && (
        <PushBtn
          disabled={disabled}
          onBeforeHook={handleBefore}
          onServerErrorHook={handleServerError}
          onSuccessHook={handleSuccess}
        />
      )}
      <div className="my1" />
      <Feedback
        loading={disabled}
        errorMsg={errorMsg}
        successMsg={successMsg}
      />
      <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(curUser, null, 2)}
      </pre>
    </div>
  );
};

HomePage.propTypes = {
  curUser: propType(userFragment).isRequired,
};

const WrappedHomePage = compose(withFormProps, withPWABtnProps)(HomePage);

export default ({ curUser }) => ([
  <SEO
    key="seo"
    schema="AboutPage"
    title="Home Page"
    description="A starting point for Meteor applications."
    contentType="product"
  />,

  <WrappedHomePage key="home" curUser={curUser} />,
]);
