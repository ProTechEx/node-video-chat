import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import CREATE_CONTACT_REQUEST from '../../../graphql/mutations/contact-requests/create.graphql';
import USER_SEARCH_QUERY from '../../../graphql/queries/contact-requests/user-search.graphql';
import { addError, clearError } from '../../../actions/error';
import { addNotice } from '../../../actions/notice';
import Loader from '../../Layout/Loader';
import '../../../styles/contact-requests-search-result.scss';

/**
 * @class SearchResult
 * @extends {React.PureComponent}
 */
class SearchResult extends React.PureComponent {
  /**
   * @constructor
   * @constructs SearchResult
   * @param {Object} props for component
   */
  constructor(props) {
    super(props);
    this.state = { submitting: false };
    this.handleClick = this.handleClick.bind(this);
    this.handleError = this.handleError.bind(this);
  }
  /**
   * @returns {Promise<undefined>} submits new contact request
   */
  async handleClick() {
    this.props.clearError();
    await new Promise(resolve => this.setState({ submitting: true }, resolve));
    try {
      const { data } = await this.props.createContactRequest({
        variables: { userid: this.props.userid },
        refetchQueries: [{ query: USER_SEARCH_QUERY, variables: { query: this.props.query } }],
      });
      if (!data.result) return this.handleError();
      const { success, message } = data.result;
      if (!success) return this.handleError(message);
      await new Promise(resolve => this.setState({ submitting: false }, resolve));
      return this.props.addNotice('Contact request sent!');
    } catch (err) {
      console.log(err);
      return this.handleError();
    }
  }
  /**
   * @param {string} error message to display
   * @returns {Promise<undefined>} sets state and displays error
   */
  async handleError(error = 'Something went wrong sending your contact request') {
    await new Promise(resolve => this.setState({ submitting: false }, resolve));
    return this.props.addError(error);
  }
  /**
   * render
   * @returns {JSX.Element} HTML
   */
  render() {
    return (
      <div className="contact-request-search-result display-flex align-items-center">
        <div className="user display-flex align-items-center">
          <img
            alt={this.props.username}
            src={this.props.pictureUrl}
          />
          <div className="user-info flex-column">
            <span className="username">
              {this.props.username}
            </span>
            <span className="email">
              {this.props.email}
            </span>
          </div>
        </div>
        {this.state.submitting ? (
          <Loader />
        ) : (
          <button onClick={this.handleClick}>
            <i className="fa fa-plus" />
          </button>
        )}
      </div>
    );
  }
}

SearchResult.propTypes = {
  userid: PropTypes.number,
  username: PropTypes.string,
  email: PropTypes.string,
  pictureUrl: PropTypes.string,
  query: PropTypes.string,
  addError: PropTypes.func,
  clearError: PropTypes.func,
  addNotice: PropTypes.func,
  createContactRequest: PropTypes.func,
};

export default compose(
  connect(
    state => ({ query: state.contactRequests.query }),
    { addError, clearError, addNotice },
  ),
  graphql(CREATE_CONTACT_REQUEST, { name: 'createContactRequest' }),
)(SearchResult);