import React from 'react';
import { X, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Branch } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './BranchesModal.css';

interface BranchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (branchName: string) => void;
  selectionMode?: boolean;
}

const branches: Branch[] = [
  { id: '1', name: 'Simba City Center (UTC)', address: 'Union Trade Centre, 1 KN 4 Ave', city: 'Kigali', phone: '+250 788 000 001' },
  { id: '2', name: 'Simba Gishushu', address: 'KN 5 Rd', city: 'Kigali', phone: '+250 788 000 002' },
  { id: '3', name: 'Simba Nyarutarama', address: 'KG 541 St', city: 'Kigali', phone: '+250 788 000 003' },
  { id: '4', name: 'Simba Kimironko', address: '342F+3V5, Kimironko', city: 'Kigali', phone: '+250 788 000 005' },
  { id: '5', name: 'Simba Kicukiro', address: 'KG 192 St', city: 'Kigali', phone: '+250 788 000 007' },
  { id: '6', name: 'Simba Nyamirambo', address: 'Near Cosmos, Nyamirambo', city: 'Kigali', phone: '+250 788 000 006' },
  { id: '7', name: 'Simba Kimihurura', address: 'KG 28 St', city: 'Kigali', phone: '+250 788 000 008' },
  { id: '8', name: 'Simba Kanombe', address: 'KK 35 Ave', city: 'Kigali', phone: '+250 788 000 004' },
  { id: '9', name: 'Simba Gisozi', address: 'ULK Road', city: 'Kigali', phone: '+250 788 000 009' },
  { id: '10', name: 'Simba Gisenyi', address: '8754+P7W', city: 'Gisenyi', phone: '+250 788 000 010' },
];

const BranchesModal: React.FC<BranchesModalProps> = ({ isOpen, onClose, onSelect, selectionMode = false }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleBranchClick = (branchName: string) => {
    if (selectionMode && onSelect) {
      onSelect(branchName);
    }
  };

  return (
    <div className="branches-overlay" onClick={onClose}>
      <div className="branches-modal" onClick={(e) => e.stopPropagation()}>
        <div className="branches-header">
          <div className="header-title">
            <MapPin size={24} color="var(--primary)" />
            <h2>{selectionMode ? 'Choose Pickup Branch' : (t('ourBranches') || 'Our Branches')}</h2>
          </div>
          <button className="branches-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="branches-content">
          <p className="branches-intro">
            {selectionMode 
              ? 'Please select a Simba Supermarket branch where you will pick up your order.' 
              : 'Visit any of our Simba Supermarket locations across Rwanda for the best shopping experience.'}
          </p>
          
          <div className="branches-grid">
            {branches.map((branch) => (
              <div 
                key={branch.id} 
                className={`branch-card ${selectionMode ? 'selectable' : ''}`}
                onClick={() => handleBranchClick(branch.name)}
              >
                <div className="branch-info">
                  <h3>{branch.name}</h3>
                  <div className="branch-detail">
                    <MapPin size={16} />
                    <span>{branch.address}, {branch.city}</span>
                  </div>
                  {branch.phone && (
                    <div className="branch-detail">
                      <Phone size={16} />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>
                {!selectionMode && (
                  <button className="view-map-btn" onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps/search/Simba+Supermarket+${branch.name}`, '_blank');
                  }}>
                    <ExternalLink size={14} />
                    Map
                  </button>
                )}
                {selectionMode && (
                  <button className="select-branch-btn">
                    Select
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchesModal;
