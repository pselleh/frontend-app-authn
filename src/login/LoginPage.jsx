import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, StatefulButton } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { Link, useNavigate } from 'react-router-dom';

import {
  FormGroup,
  InstitutionLogistration,
  PasswordField,
  RedirectLogistration,
  ThirdPartyAuthAlert,
} from '../common-components';
import AccountActivationMessage from './AccountActivationMessage';
import {
  clearThirdPartyAuthContextErrorMessage,
  getThirdPartyAuthContext,
} from '../common-components/data/actions';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import ThirdPartyAuth from '../common-components/ThirdPartyAuth';
import {
  PENDING_STATE,
  REGISTER_PAGE,
  RESET_PAGE,
} from '../data/constants';
import {
  getActivationStatus,
  getAllPossibleQueryParams,
  getTpaHint,
  getTpaProvider,
  updatePathWithQueryParams,
} from '../data/utils';
import ResetPasswordSuccess from '../reset-password/ResetPasswordSuccess';
import {
  getRecaptchaToken,
  RECAPTCHA_ACTIONS,
} from '../utils/recaptcha';
import { backupLoginForm, backupLoginFormBegin, dismissPasswordResetBanner, loginRequest } from './data/actions';
import { INVALID_FORM, TPA_AUTHENTICATION_FAILURE } from './data/constants';
import LoginFailureMessage from './LoginFailure';
import messages from './messages';

const LoginPage = ({
  institutionLogin,
  handleInstitutionLogin,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const backupFormState = useCallback((data) => dispatch(backupLoginFormBegin(data)), [dispatch]);
  const getTPADataFromBackend = useCallback(() => dispatch(getThirdPartyAuthContext()), [dispatch]);
  const {
    backedUpFormData,
    loginErrorCode,
    loginErrorContext,
    loginResult,
    shouldBackupState,
    showResetPasswordSuccessBanner,
    submitState,
    thirdPartyAuthContext,
    thirdPartyAuthApiStatus,
  } = useSelector((state) => ({
    backedUpFormData: state.login.loginFormData,
    loginErrorCode: state.login.loginErrorCode,
    loginErrorContext: state.login.loginErrorContext,
    loginResult: state.login.loginResult,
    shouldBackupState: state.login.shouldBackupState,
    showResetPasswordSuccessBanner: state.login.showResetPasswordSuccessBanner,
    submitState: state.login.submitState,
    thirdPartyAuthContext: thirdPartyAuthContextSelector(state),
    thirdPartyAuthApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
  }));
  const {
    providers,
    currentProvider,
    secondaryProviders,
    finishAuthUrl,
    platformName,
    errorMessage: thirdPartyErrorMessage,
  } = thirdPartyAuthContext;
  const { formatMessage } = useIntl();
  const activationMsgType = getActivationStatus();
  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);

  const [formFields, setFormFields] = useState({ ...backedUpFormData.formFields });
  const [errorCode, setErrorCode] = useState({
    type: '',
    count: 0,
    context: {},
  });
  const [errors, setErrors] = useState({ ...backedUpFormData.errors });
  const tpaHint = getTpaHint();

  useEffect(() => {
    sendPageEvent('login_and_registration', 'login');
  }, []);

  useEffect(() => {
    
  const payload = { ...queryParams };
    if (tpaHint) {
      payload.tpa_hint = tpaHint;
    }
    getTPADataFromBackend(payload);
  }, [queryParams, tpaHint, getTPADataFromBackend]);
  /**
   * Backup the login form in redux when login page is toggled.
   */
  useEffect(() => {
    if (shouldBackupState) {
      backupFormState({
        formFields: { ...formFields },
        errors: { ...errors },
      });
    }
  }, [backupFormState, shouldBackupState, formFields, errors]);

  useEffect(() => {
    if (loginErrorCode) {
      setErrorCode(prevState => ({
        type: loginErrorCode,
        count: prevState.count + 1,
        context: { ...loginErrorContext },
      }));
    }
  }, [loginErrorCode, loginErrorContext]);

  useEffect(() => {
    if (thirdPartyErrorMessage) {
      setErrorCode((prevState) => ({
        type: TPA_AUTHENTICATION_FAILURE,
        count: prevState.count + 1,
        context: {
          errorMessage: thirdPartyErrorMessage,
        },
      }));
    }
  }, [thirdPartyErrorMessage]);

  const validateFormFields = (payload) => {
    const {
      emailOrUsername,
      password,
    } = payload;
    const fieldErrors = { ...errors };

    if (emailOrUsername === '') {
      fieldErrors.emailOrUsername = formatMessage(messages['email.validation.message']);
    } else if (emailOrUsername.length < 2) {
      fieldErrors.emailOrUsername = formatMessage(messages['username.or.email.format.validation.less.chars.message']);
    }
    if (password === '') {
      fieldErrors.password = formatMessage(messages['password.validation.message']);
    }

    return { ...fieldErrors };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (showResetPasswordSuccessBanner) {
      dispatch(dismissPasswordResetBanner());
    }

    const formData = { ...formFields };
    const validationErrors = validateFormFields(formData);
    if (validationErrors.emailOrUsername || validationErrors.password) {
      setErrors({ ...validationErrors });
      setErrorCode(prevState => ({
        type: INVALID_FORM,
        count: prevState.count + 1,
        context: {},
      }));
      return;
    }

    // add query params to the payload
    
    let recaptchaToken;  

    try {
      recaptchaToken = await getRecaptchaToken(
        RECAPTCHA_ACTIONS.LOGIN,
      );
    } catch (error) {
      setErrorCode((prevState) => ({
        type: INVALID_FORM,
        count: prevState.count + 1,
        context: {
          message: error.message,
        },
      }));
      return;
    }

    const payload = {
      email_or_username: formData.emailOrUsername,
      password: formData.password,
      recaptcha_token: recaptchaToken,
      recaptcha_action: RECAPTCHA_ACTIONS.LOGIN,
      ...queryParams,
    };

    dispatch(loginRequest(payload));    


  };

  const handleOnChange = (event) => {
    const {
      name,
      value,
    } = event.target;
    setFormFields(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOnFocus = (event) => {
    const { name } = event.target;
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: '',
    }));
  };
  const trackForgotPasswordLinkClick = () => {
    sendTrackEvent('edx.bi.password-reset_form.toggled', { category: 'user-engagement' });
  };

  const goToRegister = (event) => {
    event.preventDefault();
    sendTrackEvent('edx.bi.register_form.toggled', { category: 'user-engagement' });
    dispatch(clearThirdPartyAuthContextErrorMessage());
    dispatch(backupLoginForm());
    navigate(updatePathWithQueryParams(REGISTER_PAGE));
  };

  const {
    provider,
    skipHintedLogin,
  } = getTpaProvider(tpaHint, providers, secondaryProviders);

  if (tpaHint) {
    if (thirdPartyAuthApiStatus === PENDING_STATE) {
      return <Skeleton height={36} />;
    }

    if (skipHintedLogin) {
      window.location.href = getConfig().LMS_BASE_URL + provider.loginUrl;
      return null;
    }

    if (provider) {
      return <EnterpriseSSO provider={provider} />;
    }
  }

  if (institutionLogin) {
    return (
      <InstitutionLogistration
        secondaryProviders={secondaryProviders}
        headingTitle={formatMessage(messages['institution.login.page.title'])}
      />
    );
  }
  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['login.page.title'], { siteName: getConfig().SITE_NAME })}</title>
      </Helmet>
      <RedirectLogistration
        success={loginResult.success}
        redirectUrl={loginResult.redirectUrl}
        finishAuthUrl={finishAuthUrl}
      />
      <div className="cba-auth-login">
        <div className="cba-auth-card">
          <LoginFailureMessage
            errorCode={errorCode.type}
            errorCount={errorCode.count}
            context={errorCode.context}
          />
          <AccountActivationMessage
            messageType={activationMsgType}
          />
          {showResetPasswordSuccessBanner && <ResetPasswordSuccess />}

          <header className="cba-auth-card__header">
            <p className="cba-auth-card__eyebrow">
              {formatMessage(messages['login.page.eyebrow'])}
            </p>
            <h1 className="cba-auth-card__title">
              {formatMessage(messages['login.page.heading'])}
            </h1>
            <p className="cba-auth-card__lead">
              {formatMessage(messages['login.page.subheading'])}
            </p>
          </header>
          <ThirdPartyAuthAlert
            currentProvider={currentProvider}
            platformName={platformName}
          />
          <Form id="sign-in-form" name="sign-in-form">
            <FormGroup
              name="emailOrUsername"
              value={formFields.emailOrUsername}
              autoComplete="on"
              handleChange={handleOnChange}
              handleFocus={handleOnFocus}
              errorMessage={errors.emailOrUsername}
              floatingLabel={formatMessage(messages['login.user.identity.label'])}
            />
            <PasswordField
              name="password"
              value={formFields.password}
              autoComplete="current-password"
              showScreenReaderText={false}
              showRequirements={false}
              handleChange={handleOnChange}
              handleFocus={handleOnFocus}
              errorMessage={errors.password}
              floatingLabel={formatMessage(messages['login.password.label'])}
            />
            <div className="d-flex justify-content-end mb-3">
              <Link
                id="forgot-password"
                name="forgot-password"
                className="btn btn-link font-weight-500 text-body p-0"
                to={updatePathWithQueryParams(RESET_PAGE)}
                onClick={trackForgotPasswordLinkClick}
              >
                {formatMessage(messages['forgot.password'])}
              </Link>
            </div>

            <StatefulButton
              name="sign-in"
              id="sign-in"
              type="submit"
              variant="brand"
              className="login-button-width"
              state={submitState}
              labels={{
                default: formatMessage(messages['sign.in.button']),
                pending: '',
              }}
              onClick={handleSubmit}
              onMouseDown={(event) => event.preventDefault()}
            />

            <div className="cba-auth-card__footer">
              {(getConfig().ALLOW_PUBLIC_ACCOUNT_CREATION !== false
                && getConfig().SHOW_REGISTRATION_LINKS !== false) && (
                <>
                  <span>
                    {formatMessage(messages['new.user.label'])}
                    {' '}
                  </span>
                  <Link
                    id="create-account"
                    name="create-account"
                    to={updatePathWithQueryParams(REGISTER_PAGE)}
                    onClick={goToRegister}
                  >
                    {formatMessage(messages['create.account.link'])}
                  </Link>
                </>
              )}
            </div>
            <ThirdPartyAuth
              currentProvider={currentProvider}
              providers={providers}
              secondaryProviders={secondaryProviders}
              handleInstitutionLogin={handleInstitutionLogin}
              thirdPartyAuthApiStatus={thirdPartyAuthApiStatus}
              isLoginPage
            />
          </Form>
        </div>
      </div>
    </>
  );
};

LoginPage.propTypes = {
  institutionLogin: PropTypes.bool.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
};

export default LoginPage;
