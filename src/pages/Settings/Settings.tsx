import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts';
import { Button } from '../../components/common';
import { organizationService, userService } from '../../services';
import { useOrganization } from '../../context';
import { roleColors, roleLabels, planLabels } from '../../types/organization';
import type { 
  Organization, 
  OrganizationMember, 
  PendingInvitation,
  UserRole 
} from '../../types';
import './Settings.css';

// Icons
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DeleteUserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Helpers
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
};

// Member Modal Component
interface MemberModalProps {
  member: OrganizationMember;
  onClose: () => void;
  onSave: (memberId: string, role: UserRole) => void;
  onDelete: (memberId: string) => Promise<void>;
  onUpdateName?: (memberId: string, fullName: string) => Promise<void>;
  currentUserRole: UserRole;
  currentUserId?: string;
}

const MemberModal: React.FC<MemberModalProps> = ({ 
  member, 
  onClose, 
  onSave, 
  onDelete, 
  onUpdateName,
  currentUserRole,
  currentUserId 
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(member.role);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(member.fullName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  
  const isCurrentUser = member.id === currentUserId;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(member.id, selectedRole);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(member.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateName = async () => {
    if (!editedName.trim() || !onUpdateName || isSavingName) return;
    
    setIsSavingName(true);
    try {
      await onUpdateName(member.id, editedName.trim());
      setIsEditingName(false);
    } catch (err) {
      console.error('Failed to update name:', err);
    } finally {
      setIsSavingName(false);
    }
  };

  // Can't modify OWNER, SYSTEM_ADMIN or self
  const canModify = member.role !== 'OWNER' && member.role !== 'SYSTEM_ADMIN' && (currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' || currentUserRole === 'SYSTEM_ADMIN');
  const roles: UserRole[] = ['ADMIN', 'ANALYST', 'VIEWER'];

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-modal__header">
          {isEditingName ? (
            <div className="settings-modal__name-edit-wrapper">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateName();
                  } else if (e.key === 'Escape') {
                    setIsEditingName(false);
                    setEditedName(member.fullName || '');
                  }
                }}
                autoFocus
                className="settings-modal__name-input"
                disabled={isSavingName}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdateName}
                isLoading={isSavingName}
                disabled={isSavingName || !editedName.trim()}
                className="settings-modal__name-save"
              >
                Save
              </Button>
              <button
                className="settings-modal__name-cancel"
                onClick={() => {
                  setIsEditingName(false);
                  setEditedName(member.fullName || '');
                }}
                disabled={isSavingName}
              >
                <CloseIcon />
              </button>
            </div>
          ) : (
            <div className="settings-modal__name-wrapper">
              <h3 className="settings-modal__name">{member.fullName || member.email}</h3>
              {isCurrentUser && onUpdateName && (
                <button
                  className="settings-modal__name-edit-btn"
                  onClick={() => setIsEditingName(true)}
                  title="Edit your name"
                >
                  <EditIcon />
                </button>
              )}
            </div>
          )}
          {canModify && !isEditingName && (
            <button 
              className="settings-modal__delete-btn"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete User"
            >
              <DeleteUserIcon />
            </button>
          )}
        </div>

        {/* Email */}
        <div className="settings-modal__row">
          <span className="settings-modal__label">Email</span>
          <span className="settings-modal__value">{member.email}</span>
        </div>

        {/* Status */}
        <div className="settings-modal__row">
          <span className="settings-modal__label">Status</span>
          <div className="settings-modal__status">
            <span className={`settings-modal__status-dot settings-modal__status-dot--${member.isActive ? 'active' : 'inactive'}`} />
            <span className="settings-modal__status-text">
              {member.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Role */}
        <div className="settings-modal__row">
          <span className="settings-modal__label">Role</span>
          {canModify ? (
            <div className="settings-modal__role-dropdown">
              <button 
                className="settings-modal__role-btn"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <span 
                  className="settings-modal__role-badge"
                  style={{ 
                    backgroundColor: roleColors[selectedRole].bg,
                    color: roleColors[selectedRole].text,
                    borderColor: roleColors[selectedRole].border
                  }}
                >
                  {roleLabels[selectedRole]}
                </span>
                <ChevronDownIcon />
              </button>
              {showRoleDropdown && (
                <div className="settings-modal__role-options">
                  {roles.map(role => (
                    <button
                      key={role}
                      className="settings-modal__role-option"
                      onClick={() => {
                        setSelectedRole(role);
                        setShowRoleDropdown(false);
                      }}
                    >
                      <span 
                        className="settings-modal__role-badge"
                        style={{ 
                          backgroundColor: roleColors[role].bg,
                          color: roleColors[role].text,
                          borderColor: roleColors[role].border
                        }}
                      >
                        {roleLabels[role]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span 
              className="settings-modal__role-badge"
              style={{ 
                backgroundColor: roleColors[member.role].bg,
                color: roleColors[member.role].text,
                borderColor: roleColors[member.role].border
              }}
            >
              {roleLabels[member.role]}
            </span>
          )}
        </div>

        {/* Joined */}
        <div className="settings-modal__footer">
          <div className="settings-modal__joined">
            <span className="settings-modal__joined-label">Joined</span>
            <span className="settings-modal__joined-date">
              {formatDate(member.createdAt)} {formatTime(member.createdAt)}
            </span>
          </div>
          {canModify && (
            <Button 
              variant="primary" 
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="settings-modal__confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="settings-modal__confirm" onClick={e => e.stopPropagation()}>
              <button 
                className="settings-modal__confirm-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <CloseIcon />
              </button>
              <p>Are you sure to remove "{member.fullName || member.email}"?</p>
              <Button 
                variant="primary" 
                onClick={handleDelete} 
                isLoading={isDeleting}
                disabled={isDeleting}
                className="settings-modal__confirm-btn"
              >
                {isDeleting ? 'Removing...' : 'Remove User'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add Member Modal Component
interface AddMemberModalProps {
  onClose: () => void;
  onAdd: (email: string, role: UserRole) => Promise<string | null>;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onAdd }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('VIEWER');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const roles: UserRole[] = ['ADMIN', 'ANALYST', 'VIEWER'];

  const handleAdd = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    setIsAdding(true);
    setError('');
    
    try {
      const link = await onAdd(email, selectedRole);
      if (link) {
        setInviteLink(link);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show invite link after creation
  if (inviteLink) {
    return (
      <div className="settings-modal-overlay" onClick={onClose}>
        <div className="settings-modal settings-modal--add" onClick={e => e.stopPropagation()}>
          <div className="settings-modal__header">
            <h3 className="settings-modal__title">Invitation Created!</h3>
            <button className="settings-modal__close-btn" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className="settings-modal__invite-success">
            <p>Share this link with your team member:</p>
            <div className="settings-modal__invite-link">
              <input type="text" value={inviteLink} readOnly />
              <button onClick={handleCopyLink} className="settings-modal__copy-btn">
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="settings-modal__invite-note">
              This link expires in 7 days. The recipient will be asked to set their name and password.
            </p>
          </div>

          <div className="settings-modal__actions">
            <Button variant="primary" onClick={onClose} fullWidth>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal settings-modal--add" onClick={e => e.stopPropagation()}>
        <div className="settings-modal__header">
          <h3 className="settings-modal__title">Invite New Member</h3>
          <button className="settings-modal__close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="settings-modal__form">
          <div className="settings-modal__field">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="member@company.com"
              className={error ? 'error' : ''}
            />
            {error && <span className="settings-modal__error">{error}</span>}
          </div>

          <div className="settings-modal__field">
            <label>Role</label>
            <div className="settings-modal__role-dropdown">
              <button 
                className="settings-modal__role-btn settings-modal__role-btn--full"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <span 
                  className="settings-modal__role-badge"
                  style={{ 
                    backgroundColor: roleColors[selectedRole].bg,
                    color: roleColors[selectedRole].text,
                    borderColor: roleColors[selectedRole].border
                  }}
                >
                  {roleLabels[selectedRole]}
                </span>
                <ChevronDownIcon />
              </button>
              {showRoleDropdown && (
                <div className="settings-modal__role-options">
                  {roles.map(role => (
                    <button
                      key={role}
                      className="settings-modal__role-option"
                      onClick={() => {
                        setSelectedRole(role);
                        setShowRoleDropdown(false);
                      }}
                    >
                      <span 
                        className="settings-modal__role-badge"
                        style={{ 
                          backgroundColor: roleColors[role].bg,
                          color: roleColors[role].text,
                          borderColor: roleColors[role].border
                        }}
                      >
                        {roleLabels[role]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="settings-modal__actions">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} isLoading={isAdding}>
            {isAdding ? 'Creating...' : 'Create Invite Link'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Settings Component
export const Settings: React.FC = () => {
  // Use organization from context for synced state across app
  const { organization: contextOrganization, updateOrganizationName } = useOrganization();
  
  // Set page title
  useEffect(() => {
    document.title = 'Settings - WhitepaperIQ';
  }, []);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current user from storage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser?.id;
  const currentUserRole: UserRole = currentUser?.role || 'VIEWER';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch organization and members in parallel
        const [orgData, membersData] = await Promise.all([
          organizationService.getOrganization(),
          organizationService.getMembers(),
        ]);
        
        setOrganization(orgData);
        setEditedName(orgData.name);
        setMembers(membersData.users);
        setPendingInvitations(membersData.pendingInvitations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organization data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Sync with context when it updates
  useEffect(() => {
    if (contextOrganization && organization) {
      setOrganization(contextOrganization);
      setEditedName(contextOrganization.name);
    }
  }, [contextOrganization]);

  const handleSaveName = async () => {
    if (!editedName.trim() || !organization || isSavingName) return;
    
    setIsSavingName(true);
    try {
      const updated = await organizationService.updateOrganization({ name: editedName });
      setOrganization(updated);
      // Update context so Sidebar gets the new name immediately
      updateOrganizationName(editedName);
      setIsEditingName(false);
    } catch (err) {
      console.error('Failed to update organization name:', err);
      // Optionally show error to user
    } finally {
      setIsSavingName(false);
    }
  };

  const handleMemberSave = async (memberId: string, role: UserRole) => {
    try {
      const updated = await organizationService.updateMember(memberId, { role });
      setMembers(prev => prev.map(m => m.id === memberId ? updated : m));
      setSelectedMember(null);
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  const handleMemberDelete = async (memberId: string) => {
    setDeletingMemberId(memberId);
    try {
      await organizationService.removeMember(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setSelectedMember(null);
    } catch (err) {
      console.error('Failed to remove member:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setDeletingMemberId(null);
    }
  };

  const handleUpdateMemberName = async (memberId: string, fullName: string) => {
    try {
      const updated = await userService.updateProfile({ fullName });
      // Update members list
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, fullName: updated.fullName } : m));
      // Update current user in storage
      localStorage.setItem('user', JSON.stringify(updated));
      // Update selected member if it's the same
      if (selectedMember?.id === memberId) {
        setSelectedMember({ ...selectedMember, fullName: updated.fullName });
      }
    } catch (err) {
      console.error('Failed to update member name:', err);
      throw err;
    }
  };

  const handleAddMember = async (email: string, role: UserRole): Promise<string | null> => {
    try {
      const invitation = await organizationService.inviteMember({ email, role });
      // Add to pending invitations
      setPendingInvitations(prev => [...prev, invitation]);
      // Return the invite link
      return organizationService.getInviteLink(invitation.token);
    } catch (err) {
      throw err;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="settings__loading">
          <span className="settings__spinner" />
          <span>Loading organization...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !organization) {
    return (
      <MainLayout>
        <div className="settings__error">
          <h2>Organization Not Found</h2>
          <p>{error || 'Unable to load organization data.'}</p>
        </div>
      </MainLayout>
    );
  }

  const remainingPercentage = organization.credits.total > 0 
    ? (organization.credits.remaining / organization.credits.total) * 100 
    : 0;

  return (
    <MainLayout>
      <div className="settings">
        <h1 className="settings__title">{organization.name} Organization</h1>

        <div className="settings__grid">
          {/* Organization Members Card */}
          <div className="settings__card">
            <h2 className="settings__card-title">Organization Members</h2>
            
            <div className="settings__members-list">
              {/* Active Members */}
              {members.map(member => (
                <div key={member.id} className="settings__member">
                  <div className="settings__member-info">
                    <span className="settings__member-name">
                      {member.fullName || member.email}
                    </span>
                    <span 
                      className="settings__member-role"
                      style={{ 
                        backgroundColor: roleColors[member.role].bg,
                        color: roleColors[member.role].text,
                        borderColor: roleColors[member.role].border
                      }}
                    >
                      {roleLabels[member.role]}
                    </span>
                  </div>
                  {deletingMemberId === member.id ? (
                    <div className="settings__member-deleting">
                      <span className="settings__spinner" />
                      <span>Removing...</span>
                    </div>
                  ) : (
                    <button 
                      className="settings__member-settings"
                      onClick={() => setSelectedMember(member)}
                    >
                      <SettingsIcon />
                    </button>
                  )}
                </div>
              ))}
              
              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <>
                  <div className="settings__pending-divider">
                    <span>Pending Invitations</span>
                  </div>
                  {pendingInvitations.map(invitation => (
                    <div key={invitation.id} className="settings__member settings__member--pending">
                      <div className="settings__member-info">
                        <span className="settings__member-name settings__member-name--pending">
                          <ClockIcon />
                          <span>{invitation.email}</span>
                        </span>
                        <span 
                          className="settings__member-role"
                          style={{ 
                            backgroundColor: roleColors[invitation.role].bg,
                            color: roleColors[invitation.role].text,
                            borderColor: roleColors[invitation.role].border
                          }}
                        >
                          {roleLabels[invitation.role]}
                        </span>
                      </div>
                      <div className="settings__member-expires">
                        <span className="settings__member-expires-label">Expires</span>
                        <span className="settings__member-expires-date">{formatDate(invitation.expiresAt)}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' || currentUserRole === 'SYSTEM_ADMIN') && (
              <button 
                className="settings__add-member"
                onClick={() => setShowAddMember(true)}
              >
                <PlusIcon />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {/* Organization Settings Card */}
          <div className="settings__card">
            <h2 className="settings__card-title">Organization Settings</h2>

            <div className="settings__field">
              <label className="settings__field-label">Organization Name</label>
              <div className="settings__field-input">
                {isEditingName ? (
                  <div className="settings__field-edit-wrapper">
                    <input 
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveName();
                        } else if (e.key === 'Escape') {
                          setEditedName(organization.name);
                          setIsEditingName(false);
                        }
                      }}
                      autoFocus
                      className="settings__field-edit-input"
                    />
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handleSaveName}
                      isLoading={isSavingName}
                      disabled={isSavingName || !editedName.trim() || editedName === organization.name}
                      className="settings__field-save-btn"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <span>{organization.name}</span>
                    {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' || currentUserRole === 'SYSTEM_ADMIN') && (
                      <button 
                        className="settings__field-edit"
                        onClick={() => setIsEditingName(true)}
                      >
                        <EditIcon />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="settings__field">
              <label className="settings__field-label">Subscription Plan</label>
              <div className="settings__field-value">
                {planLabels[organization.plan]}
              </div>
            </div>

            <div className="settings__field">
              <label className="settings__field-label">Billing Cycle Start</label>
              <div className="settings__field-value">
                {formatDate(organization.billing.cycleStart)}
              </div>
            </div>

            <div className="settings__field">
              <label className="settings__field-label">Credits Remaining</label>
              <div className="settings__usage">
                <div className="settings__usage-bar">
                  <div 
                    className="settings__usage-fill" 
                    style={{ width: `${remainingPercentage}%` }}
                  />
                </div>
                <span className="settings__usage-text">
                  {organization.credits.remaining} / {organization.credits.total} credits
                </span>
              </div>
            </div>

            <div className="settings__created">
              <span className="settings__created-label">Created</span>
              <span className="settings__created-date">
                {formatDate(organization.createdAt)} {formatTime(organization.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSave={handleMemberSave}
          onDelete={handleMemberDelete}
          onUpdateName={handleUpdateMemberName}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
        />
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onAdd={handleAddMember}
        />
      )}
    </MainLayout>
  );
};

export default Settings;
