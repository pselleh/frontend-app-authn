import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthService } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { ChevronLeft } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import BaseContainer from '../base-container';
import {
  tpaProvidersSelector,
} from '../common-components/data/selectors';
import messages from '../common-components/messages';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import {
  getTpaHint, getTpaProvider, updatePathWithQueryParams,
} from '../data/utils';
import LoginComponentSlot from '../plugin-slots/LoginComponentSlot';
import { RegistrationPage } from '../register';

const Logistration = ({
  selectedPage,
}) => {
  const tpaHint = getTpaHint();
  const tpaProviders = useSelector(tpaProvidersSelector);
  const {
    providers,
    secondaryProviders,
  } = tpaProviders;
  const { formatMessage } = useIntl();
  const [institutionLogin, setInstitutionLogin] = useState(false);
  const navigate = useNavigate();
  const disablePublicAccountCreation = getConfig().ALLOW_PUBLIC_ACCOUNT_CREATION === false;
  const hideRegistrationLink = getConfig().SHOW_REGISTRATION_LINKS === false;

  useEffect(() => {
    const authService = getAuthService();
    if (authService) {
      authService.getCsrfTokenService()
        .getCsrfToken(getConfig().LMS_BASE_URL);
    }
  });

  useEffect(() => {
    document.body.classList.add('cba-auth-page');
    return () => {
      document.body.classList.remove('cba-auth-page');
    };
  }, []);

  useEffect(() => {
    if (disablePublicAccountCreation) {
      navigate(updatePathWithQueryParams(LOGIN_PAGE));
    }
  }, [navigate, disablePublicAccountCreation]);

  const handleInstitutionLogin = (e) => {
    sendTrackEvent('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    if (typeof e === 'string') {
      sendPageEvent('login_and_registration', e === '/login' ? 'login' : 'register');
    } else {
      sendPageEvent('login_and_registration', e.target.dataset.eventName);
    }

    setInstitutionLogin(!institutionLogin);
  };

  const tabTitle = (
    <div className="d-flex">
      <Icon src={ChevronLeft} className="left-icon" />
      <span className="ml-2">
        {selectedPage === LOGIN_PAGE
          ? formatMessage(messages['logistration.sign.in'])
          : formatMessage(messages['logistration.register'])}
      </span>
    </div>
  );

  const isValidTpaHint = () => {
    const { provider } = getTpaProvider(tpaHint, providers, secondaryProviders);
    return !!provider;
  };

  return (
    <BaseContainer>
      <div className={`cba-auth${selectedPage === LOGIN_PAGE ? ' cba-auth--login' : ' cba-auth--register'}`}>
        {disablePublicAccountCreation
          ? (
            <>
              {institutionLogin && (
                <Tabs defaultActiveKey="" id="controlled-tab" onSelect={handleInstitutionLogin}>
                  <Tab title={tabTitle} eventKey={LOGIN_PAGE} />
                </Tabs>
              )}
              <div id="main-content" className="main-content">
                {!institutionLogin && (
                  <h3 className="mb-4.5">{formatMessage(messages['logistration.sign.in'])}</h3>
                )}
                <LoginComponentSlot
                  institutionLogin={institutionLogin}
                  handleInstitutionLogin={handleInstitutionLogin}
                />
              </div>
            </>
          )
          : (
            <div>
              {institutionLogin && (
                <Tabs defaultActiveKey="" id="controlled-tab" onSelect={handleInstitutionLogin}>
                  <Tab title={tabTitle} eventKey={selectedPage === LOGIN_PAGE ? LOGIN_PAGE : REGISTER_PAGE} />
                </Tabs>
              )}
              <div id="main-content" className="main-content">
                {!institutionLogin && !isValidTpaHint() && hideRegistrationLink && (
                  <h3 className="mb-4.5">
                    {formatMessage(messages[selectedPage === LOGIN_PAGE ? 'logistration.sign.in' : 'logistration.register'])}
                  </h3>
                )}
                {selectedPage === LOGIN_PAGE
                  ? (
                    <LoginComponentSlot
                      institutionLogin={institutionLogin}
                      handleInstitutionLogin={handleInstitutionLogin}
                    />
                  )
                  : (
                    <RegistrationPage
                      institutionLogin={institutionLogin}
                      handleInstitutionLogin={handleInstitutionLogin}
                    />
                  )}
              </div>
            </div>
          )}
      </div>
    </BaseContainer>
  );
};

Logistration.propTypes = {
  selectedPage: PropTypes.string,
};

Logistration.defaultProps = {
  selectedPage: REGISTER_PAGE,
};

export default Logistration;
