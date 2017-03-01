import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import EntityTypeHeader from './entity-editor/EntityTypeHeader';
import InviteUser from './modals/InviteUser';
import * as api from '../api';

require('../styles/EntityTypeHeader.scss');
require('../styles/Users.scss');

function UserActionButton({ id }) {
  return (
    <button className="showControls clickable">
      ...
    </button>
  );
}

UserActionButton.propTypes = {
  id: PropTypes.string.isRequired,
};

function User({ email, username, admin, id }) {
  return (
    <tr>
      <td>{username}</td>
      <td>{email}</td>
      <td>{admin ? 'Admin' : 'User'}</td>
      <td><UserActionButton id={id} /></td>
    </tr>
  );
}

User.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  admin: PropTypes.bool,
  id: PropTypes.string.isRequired,
};

User.defaultProps = {
  admin: false,
};

function UserList({ users }) {
  return (
    <table>
      <tbody>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
        {users.map(({ admin, email, id, username }) => (
          <User
            admin={admin}
            email={email}
            id={id}
            key={username}
            username={username}
          />
        ))}
      </tbody>
    </table>
  );
}

UserList.propTypes = {
  users: PropTypes.array.isRequired,
};

class Users extends Component {

  constructor() {
    super();
    this.state = {
      isInviteModalVisible: false,
      users: [],
    };
    this.getActionButtons = this.getActionButtons.bind(this);
    this.onInviteUser = this.onInviteUser.bind(this);
  }

  componentDidMount() {
    if (this.props.profile.admin) {
      api.get('/api/admin/users')
        .then(users => this.setState({ users }));
    }
  }

  onInviteUser(emailAddress) {
    this.setState({ isInviteModalVisible: false });
    api.post('/api/admin/invites', {
      email: emailAddress,
    });
  }

  getActionButtons() {
    const invite = {
      buttonText: 'Invite user',
      onClick: () => this.setState({ isInviteModalVisible: true }),
    };

    return [invite];
  }

  render() {
    const actionButtons = this.getActionButtons();
    const { admin } = this.props.profile;
    const saveStatus = '';
    const title = 'Members';

    if (!admin) {
      return (
        <div>
          <p>You need to be an admin user to view and invite other users.</p>
        </div>
      );
    }

    return (
      <div className="UsersContainer">
        <EntityTypeHeader
          title={title}
          saveStatus={saveStatus}
          actionButtons={actionButtons}
        />
        <div className="UserList">
          <UserList users={this.state.users} />
        </div>
        <InviteUser
          isOpen={this.state.isInviteModalVisible}
          onClose={() => this.setState({ isInviteModalVisible: false })}
          onInviteUser={this.onInviteUser}
        />
      </div>
    );
  }
}

export default connect(state => ({
  profile: state.profile,
}))(Users);

Users.propTypes = {
  profile: PropTypes.shape({
    admin: PropTypes.bool,
  }).isRequired,
};
