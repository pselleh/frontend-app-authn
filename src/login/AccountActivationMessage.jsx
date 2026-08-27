import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { ACCOUNT_ACTIVATION_MESSAGE } from './data/constants';
import messages from './messages';

const AccountActivationMessage = ({ messageType }) => {
  const { formatMessage } = useIntl();

  if (!messageType) {
    return null;
  }

  const activationOrConfirmation = getConfig().MARKETING_EMAILS_OPT_IN ? 'confirmation' : 'activation';

  let eyebrow = '';
  let heading = '';
  let body = null;

  switch (messageType) {
    case ACCOUNT_ACTIVATION_MESSAGE.SUCCESS: {
      eyebrow = formatMessage(messages[`account.${activationOrConfirmation}.success.eyebrow`]);
      heading = formatMessage(messages[`account.${activationOrConfirmation}.success.message.title`]);
      body = formatMessage(messages[`account.${activationOrConfirmation}.success.message`]);
      break;
    }
    case ACCOUNT_ACTIVATION_MESSAGE.INFO: {
      eyebrow = formatMessage(messages[`account.${activationOrConfirmation}.info.eyebrow`]);
      heading = formatMessage(messages[`account.${activationOrConfirmation}.info.message.title`]);
      body = formatMessage(messages[`account.${activationOrConfirmation}.info.message`]);
      break;
    }
    case ACCOUNT_ACTIVATION_MESSAGE.ERROR: {
      const supportLink = (
        <Hyperlink
          className="cba-auth-notice__link"
          destination={getConfig().ACTIVATION_EMAIL_SUPPORT_LINK || getConfig().LOGIN_ISSUE_SUPPORT_LINK || '#'}
          target="_blank"
          showLaunchIcon={false}
        >
          {formatMessage(messages['account.activation.support.link'])}
        </Hyperlink>
      );

      eyebrow = formatMessage(messages[`account.${activationOrConfirmation}.error.eyebrow`]);
      heading = formatMessage(messages[`account.${activationOrConfirmation}.error.message.title`]);
      body = (
        <FormattedMessage
          id="account.activation.error.message"
          defaultMessage="Something went wrong. Please {supportLink} to resolve this issue."
          description="Account activation error message"
          values={{ supportLink }}
        />
      );
      break;
    }
    default:
      return null;
  }

  return (
    <div
      id="account-activation-message"
      className={classNames(
        'cba-auth-notice',
        `cba-auth-notice--${messageType}`,
      )}
      role="status"
    >
      {eyebrow && (
        <p className="cba-auth-notice__eyebrow">{eyebrow}</p>
      )}
      {heading && (
        <h2 className="cba-auth-notice__title">{heading}</h2>
      )}
      <p className="cba-auth-notice__lead">{body}</p>
    </div>
  );
};

AccountActivationMessage.propTypes = {
  messageType: PropTypes.string,
};

AccountActivationMessage.defaultProps = {
  messageType: null,
};

export default AccountActivationMessage;
