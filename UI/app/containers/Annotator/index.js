/**
 *
 * Annotator
 *
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectAnnotator from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';

export function Annotator({
  annotator
}) {
  useInjectReducer({ key: 'annotator', reducer });
  useInjectSaga({ key: 'annotator', saga });

  return (
    <div>
      <Helmet>
        <title>Annotator</title>
        <meta name="description" content="Description of Annotator" />
      </Helmet>
      <FormattedMessage {...messages.header} />
      <div>{JSON.stringify(annotator)}</div>
    </div>
  );
}

Annotator.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  annotator: makeSelectAnnotator(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(Annotator);
