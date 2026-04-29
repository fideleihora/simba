import React from 'react';
import { X, MapPin, Phone, ExternalLink, Star } from 'lucide-react';
import { Branch } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './BranchesModal.css';

interface BranchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (branchName: string, pickupTime: string) => void;
  selectionMode?: boolean;
}

const branches: Branch[] = [
  { id: '1', name: 'Simba City Center (UTC)', address: 'Union Trade Centre, 1 KN 4 Ave', city: 'Kigali', phone: '+250 788 000 001', rating: 4.8, totalReviews: 124 },
  { id: '2', name: 'Simba Gishushu', address: 'KN 5 Rd', city: 'Kigali', phone: '+250 788 000 002', rating: 4.5, totalReviews: 89 },
  { id: '3', name: 'Simba Nyarutarama', address: 'KG 541 St', city: 'Kigali', phone: '+250 788 000 003', rating: 4.9, totalReviews: 156 },
  { id: '4', name: 'Simba Kimironko', address: '342F+3V5, Kimironko', city: 'Kigali', phone: '+250 788 000 005', rating: 4.2, totalReviews: 67 },
  { id: '5', name: 'Simba Kicukiro', address: 'KG 192 St', city: 'Kigali', phone: '+250 788 000 007', rating: 4.4, totalReviews: 53 },
  { id: '6', name: 'Simba Nyamirambo', address: 'Near Cosmos, Nyamirambo', city: 'Kigali', phone: '+250 788 000 006', rating: 4.0, totalReviews: 42 },
  { id: '7', name: 'Simba Kimihurura', address: 'KG 28 St', city: 'Kigali', phone: '+250 788 000 008', rating: 4.7, totalReviews: 95 },
  { id: '8', name: 'Simba Kanombe', address: 'KK 35 Ave', city: 'Kigali', phone: '+250 788 000 004', rating: 4.3, totalReviews: 38 },
  { id: '9', name: 'Simba Gisozi', address: 'ULK Road', city: 'Kigali', phone: '+250 788 000 009', rating: 4.1, totalReviews: 29 },
  { id: '10', name: 'Simba Gisenyi', address: '8754+P7W', city: 'Gisenyi', phone: '+250 788 000 010', rating: 4.6, totalReviews: 71 },
];

const BranchesModal: React.FC<BranchesModalProps> = ({ isOpen, onClose, onSelect, selectionMode = false }) => {
  const { t } = useLanguage();
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(null);
  const [pickupTime, setPickupTime] = React.useState<string>('');

  if (!isOpen) return null;

  const handleBranchClick = (branchName: string) => {
    if (selectionMode) {
      setSelectedBranch(branchName);
    }
  };

  const handleConfirm = () => {
    if (selectedBranch && pickupTime && onSelect) {
      onSelect(selectedBranch, pickupTime);
    }
  };

  return (
    <div className="branches-overlay" onClick={onClose}>
      <div className="branches-modal" onClick={(e) => e.stopPropagation()}>
        <div className="branches-header">
          <div className="header-title">
            <MapPin size={24} color="var(--primary)" />
            <h2>{selectionMode ? 'Checkout: Pickup Details' : (t('ourBranches') || 'Our Branches')}</h2>
          </div>
          <button className="branches-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="branches-content">
          {selectionMode ? (
            <div className="selection-stepper">
              <div className="selection-step">
                <h3>1. Select Pickup Branch</h3>
                <div className="branches-grid-mini">
                  {branches.map((branch) => (
                    <div 
                      key={branch.id} 
                      className={`branch-card-mini ${selectedBranch === branch.name ? 'active' : ''}`}
                      onClick={() => handleBranchClick(branch.name)}
                    >
                      <div className="mini-branch-info">
                        <span>{branch.name}</span>
                        <div className="mini-rating">
                          <Star size={10} fill="#ffcc00" color="#ffcc00" />
                          <span>{branch.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="selection-step">
                <h3>2. Choose Pickup Time</h3>
                <div className="time-picker-container">
                  <input 
                    type="datetime-local" 
                    className="pickup-time-input"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="time-hint">Orders usually take 30-60 mins to prepare.</p>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-block confirm-selection-btn"
                disabled={!selectedBranch || !pickupTime}
                onClick={handleConfirm}
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <>
              <p className="branches-intro">
                Visit any of our Simba Supermarket locations across Rwanda for the best shopping experience.
              </p>
              
              <div className="branches-grid">
                {branches.map((branch) => (
                  <div key={branch.id} className="branch-card">
                    <div className="branch-info">
                      <div className="branch-title-row">
                        <h3>{branch.name}</h3>
                        {branch.rating && (
                          <div className="branch-rating">
                            <Star size={14} fill="#ffcc00" color="#ffcc00" />
                            <span>{branch.rating} ({branch.totalReviews})</span>
                          </div>
                        )}
                      </div>
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
                    <button className="view-map-btn" onClick={() => window.open(`https://www.google.com/maps/search/Simba+Supermarket+${branch.name}`, '_blank')}>
                      <ExternalLink size={14} />
                      Map
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchesModal;
