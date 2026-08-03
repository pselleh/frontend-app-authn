import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Icon, IconButton, OverlayTrigger, Tooltip, useToggle,
} from '@openedx/paragon';
import {
  Check, Remove, Visibility, VisibilityOff,
} from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import messages from './messages';
import { clearRegistrationBackendError, fetchRealtimeValidations } from '../register/data/actions';
import { validatePasswordField } from '../register/data/utils';
import {
  evaluatePassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../utils/passwordPolicy';

const PasswordField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const validationApiRateLimited = useSelector(state => state.register.validationApiRateLimited);
  const [isPasswordHidden, setHiddenTrue, setHiddenFalse] = useToggle(true);
  const [showTooltip, setShowTooltip] = useState(false);
    
  const personalData = useMemo(
    () => ({
      name: props.nameValue,
      email: props.emailValue,
      username: props.usernameValue,
      organizationCode: props.organizationCode,
    }),
    [
      props.nameValue,
      props.emailValue,
      props.usernameValue,
      props.organizationCode,
    ],
  );

  const passwordEvaluation = useMemo(
    () => evaluatePassword(props.value, personalData),
    [props.value, personalData],
  );

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === props.name && e.relatedTarget?.name === 'passwordIcon') {
      return; // Do not run validations on password icon click
    }

    let passwordValue = value;
    if (name === 'passwordIcon') {
      // To validate actual password value when onBlur is triggered by focusing out the password icon
      passwordValue = props.value;
    }

    if (props.handleBlur) {
      props.handleBlur({
        target: {
          name: props.name,
          value: passwordValue,
        },
      });
    }

    setShowTooltip(props.showRequirements && false);
    if (props.handleErrorChange) { // If rendering from register page
      const fieldError = validatePasswordField(
        passwordValue,
        formatMessage,
        {
          name: props.nameValue,
          email: props.emailValue,
          username: props.usernameValue,
          organizationCode: props.organizationCode,
        },
      );
      if (fieldError) {
        props.handleErrorChange(props.name, fieldError);
      } else if (!validationApiRateLimited) {
        dispatch(fetchRealtimeValidations({ password: passwordValue }));
      }
    }
  };

  const handleFocus = (e) => {
    if (e.target?.name === 'passwordIcon') {
      return; // Do not clear error on password icon focus
    }

    if (props.handleFocus) {
      props.handleFocus(e);
    }
    if (props.handleErrorChange) {
      props.handleErrorChange(props.name, '');
      dispatch(clearRegistrationBackendError(props.name));
    }
    setTimeout(() => setShowTooltip(props.showRequirements && true), 150);
  };

  const HideButton = (
    <IconButton
      onFocus={handleFocus}
      onBlur={handleBlur}
      name="passwordIcon"
      src={VisibilityOff}
      iconAs={Icon}
      onClick={setHiddenTrue}
      size="sm"
      variant="secondary"
      alt={formatMessage(messages['hide.password'])}
    />
  );

  const ShowButton = (
    <IconButton
      onFocus={handleFocus}
      onBlur={handleBlur}
      name="passwordIcon"
      src={Visibility}
      iconAs={Icon}
      onClick={setHiddenFalse}
      size="sm"
      variant="secondary"
      alt={formatMessage(messages['show.password'])}
    />
  );

  const placement = window.innerWidth < 768 ? 'top' : 'left';
  const tooltip = (
    <Tooltip id={`password-requirement-${placement}`}>

      <span className="d-flex align-items-center">
        {passwordEvaluation.checks.minimumLength ? (
          <Icon className="text-success mr-1" src={Check} />
        ) : (
          <Icon className="mr-1 text-light-700" src={Remove} />
        )}
        {formatMessage(messages['password.requirement.length'])}
      </span>

      <span className="d-flex align-items-center">
        {passwordEvaluation.checks.noLeadingTrailingWhitespace ? (
          <Icon className="text-success mr-1" src={Check} />
        ) : (
          <Icon className="mr-1 text-light-700" src={Remove} />
        )}
        {formatMessage(messages['password.requirement.whitespace'])}
      </span>

    <span className="d-flex align-items-center">
      {passwordEvaluation.checks.noPersonalData ? (
        <Icon className="text-success mr-1" src={Check} />
      ) : (
        <Icon className="mr-1 text-light-700" src={Remove} />
      )}
      {formatMessage(messages['password.requirement.personal'])}
    </span>

    <span className="d-flex align-items-center">
      {passwordEvaluation.checks.strength ? (
        <Icon className="text-success mr-1" src={Check} />
      ) : (
        <Icon className="mr-1 text-light-700" src={Remove} />
      )}
      {formatMessage(messages['password.requirement.strength'])}
    </span>

  </Tooltip>
);

  return (
    <Form.Group controlId={props.name} isInvalid={props.errorMessage !== ''}>
      <OverlayTrigger key="tooltip" placement={placement} overlay={tooltip} show={showTooltip}>
        <Form.Control
          as="input"
          className="form-group__form-field"
          type={isPasswordHidden ? 'password' : 'text'}
          name={props.name}
          value={props.value}
          autoComplete={props.autoComplete}
          aria-invalid={props.errorMessage !== ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={props.handleChange}
          controlClassName={props.borderClass}
          trailingElement={isPasswordHidden ? ShowButton : HideButton}
          floatingLabel={props.floatingLabel}
        />
      </OverlayTrigger>
      {props.errorMessage !== '' && (
        <Form.Control.Feedback key="error" className="form-text-size" hasIcon={false} feedback-for={props.name} type="invalid">
          {props.errorMessage}
          {props.showScreenReaderText && <span className="sr-only">{formatMessage(messages['password.sr.only.helping.text'])}</span>}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

PasswordField.defaultProps = {
  borderClass: '',
  errorMessage: '',
  handleBlur: null,
  handleFocus: null,
  handleChange: () => {},
  handleErrorChange: null,

  nameValue: '',
  emailValue: '',
  usernameValue: '',
  organizationCode: '',

  showRequirements: true,
  showScreenReaderText: true,
  autoComplete: null,
};

PasswordField.propTypes = {
  borderClass: PropTypes.string,
  errorMessage: PropTypes.string,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleFocus: PropTypes.func,
  handleChange: PropTypes.func,
  handleErrorChange: PropTypes.func,

  name: PropTypes.string.isRequired,

  // NEW
  nameValue: PropTypes.string,
  emailValue: PropTypes.string,
  usernameValue: PropTypes.string,
  organizationCode: PropTypes.string,

  showRequirements: PropTypes.bool,
  value: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
  showScreenReaderText: PropTypes.bool,
};

export default PasswordField;
