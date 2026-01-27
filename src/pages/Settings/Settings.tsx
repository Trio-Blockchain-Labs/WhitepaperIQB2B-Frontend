import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts';
import { Button } from '../../components/common';
import { 
  getOrganization, 
  updateOrganization, 
  addMember, 
  updateMember, 
  deleteMember,
  roleColors,
  roleLabels 
} from '../../mock';
import type { Organization, OrganizationMember, MemberRole } from '../../types';
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

const VerifiedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6" stroke="none">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    <circle cx="12" cy="12" r="10" fill="#3B82F6" />
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
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

// Helpers
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
};

const formatPlan = (plan: string): string => {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
};

// Member Modal Component
interface MemberModalProps {
  member: OrganizationMember;
  onClose: () => void;
  onSave: (memberId: string, role: MemberRole) => void;
  onDelete: (memberId: string) => void;
}

const MemberModal: React.FC<MemberModalProps> = ({ member, onClose, onSave, onDelete }) => {
  const [selectedRole, setSelectedRole] = useState<MemberRole>(member.role);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(member.id, selectedRole);
    setIsSaving(false);
  };

  const handleDelete = () => {
    onDelete(member.id);
    setShowDeleteConfirm(false);
  };

  const roles: MemberRole[] = ['owner', 'admin', 'analyst', 'viewer'];

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-modal__header">
          <h3 className="settings-modal__name">{member.name}</h3>
          <button 
            className="settings-modal__delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete User"
          >
            <DeleteUserIcon />
          </button>
        </div>

        {/* Status */}
        <div className="settings-modal__row">
          <span className="settings-modal__label">Status</span>
          <div className="settings-modal__status">
            <span className={`settings-modal__status-dot settings-modal__status-dot--${member.status}`} />
            <span className="settings-modal__status-text">
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Role */}
        <div className="settings-modal__row">
          <span className="settings-modal__label">Role</span>
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
        </div>

        {/* Joined */}
        <div className="settings-modal__footer">
          <div className="settings-modal__joined">
            <span className="settings-modal__joined-label">Joined</span>
            <span className="settings-modal__joined-date">
              {formatDate(member.joinedAt)} {formatTime(member.joinedAt)}
            </span>
          </div>
          <Button 
            variant="primary" 
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
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
              <p>Are you sure to delete user "{member.name}"?</p>
              <Button variant="primary" onClick={handleDelete} className="settings-modal__confirm-btn">
                Delete User
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
  onAdd: (email: string, role: MemberRole) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onAdd }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>('viewer');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const roles: MemberRole[] = ['admin', 'analyst', 'viewer'];

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
    await onAdd(email, selectedRole);
    setIsAdding(false);
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal settings-modal--add" onClick={e => e.stopPropagation()}>
        <div className="settings-modal__header">
          <h3 className="settings-modal__title">Add New Member</h3>
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
            Add Member
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Settings Component
export const Settings: React.FC = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    const fetchOrganization = async () => {
      setIsLoading(true);
      const data = await getOrganization();
      setOrganization(data);
      setEditedName(data.name);
      setIsLoading(false);
    };
    fetchOrganization();
  }, []);

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    await updateOrganization({ name: editedName });
    setOrganization(prev => prev ? { ...prev, name: editedName } : null);
    setIsEditingName(false);
  };

  const handleMemberSave = async (memberId: string, role: MemberRole) => {
    await updateMember({ memberId, role });
    setOrganization(prev => {
      if (!prev) return null;
      return {
        ...prev,
        members: prev.members.map(m => m.id === memberId ? { ...m, role } : m)
      };
    });
    setSelectedMember(null);
  };

  const handleMemberDelete = async (memberId: string) => {
    await deleteMember(memberId);
    setOrganization(prev => {
      if (!prev) return null;
      return {
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      };
    });
    setSelectedMember(null);
  };

  const handleAddMember = async (email: string, role: MemberRole) => {
    const newMember = await addMember({ email, role });
    setOrganization(prev => {
      if (!prev) return null;
      return {
        ...prev,
        members: [...prev.members, newMember]
      };
    });
    setShowAddMember(false);
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

  if (!organization) {
    return (
      <MainLayout>
        <div className="settings__error">
          <h2>Organization Not Found</h2>
          <p>Unable to load organization data.</p>
        </div>
      </MainLayout>
    );
  }

  const usagePercentage = (organization.usageStats.used / organization.usageStats.total) * 100;

  return (
    <MainLayout>
      <div className="settings">
        <h1 className="settings__title">{organization.name} Organization</h1>

        <div className="settings__grid">
          {/* Organization Members Card */}
          <div className="settings__card">
            <h2 className="settings__card-title">Organization Members</h2>
            
            <div className="settings__members-list">
              {organization.members.map(member => (
                <div key={member.id} className="settings__member">
                  <div className="settings__member-info">
                    <span className="settings__member-name">
                      {member.name}
                      {member.isVerified && <VerifiedIcon />}
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
                  <button 
                    className="settings__member-settings"
                    onClick={() => setSelectedMember(member)}
                  >
                    <SettingsIcon />
                  </button>
                </div>
              ))}
            </div>

            <button 
              className="settings__add-member"
              onClick={() => setShowAddMember(true)}
            >
              <PlusIcon />
              <span>Add Member</span>
            </button>
          </div>

          {/* Organization Settings Card */}
          <div className="settings__card">
            <h2 className="settings__card-title">Organization Settings</h2>

            <div className="settings__field">
              <label className="settings__field-label">Organization Name</label>
              <div className="settings__field-input">
                {isEditingName ? (
                  <input 
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                ) : (
                  <>
                    <span>{organization.name}</span>
                    <button 
                      className="settings__field-edit"
                      onClick={() => setIsEditingName(true)}
                    >
                      <EditIcon />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="settings__field">
              <label className="settings__field-label">Subscription Plan</label>
              <div className="settings__field-value">
                {formatPlan(organization.subscriptionPlan)}
              </div>
            </div>

            <div className="settings__field">
              <label className="settings__field-label">Billing Start Date</label>
              <div className="settings__field-value">
                {formatDate(organization.billingStartDate)} {formatTime(organization.billingStartDate)}
              </div>
            </div>

            <div className="settings__field">
              <label className="settings__field-label">Usage Stats</label>
              <div className="settings__usage">
                <div className="settings__usage-bar">
                  <div 
                    className="settings__usage-fill" 
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <span className="settings__usage-text">
                  {organization.usageStats.used}/{organization.usageStats.total}
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
