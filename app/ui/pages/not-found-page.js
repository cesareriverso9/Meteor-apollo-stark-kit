import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import withSEO from '/app/ui/hocs/with-seo';
import { FormattedMessage as T, injectIntl } from 'react-intl';
import { withRouteProps } from '/app/ui/hocs';
import AuthPageLayout from '/app/ui/layouts/auth-page';

const NotFoundPage = ({ intl: { formatMessage: t }, homeUrl }) => (
  <AuthPageLayout
    key="view"
    title={t({ id: 'notFoundTitle' })}
    subtitle={t({ id: 'notFoundSubTitle' })}
    link={<Link to={homeUrl()}><T id="notFoundHomeLinkText" /></Link>}
  />
);

export default compose(
  injectIntl,
  withRouteProps,
  withSEO({ title: 'notFoundHTMLTitle' }),
)(NotFoundPage);
