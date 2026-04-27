import React from 'react';
import { X, User, ShoppingBag, PieChart, BarChart3, Settings, LogOut, Package, Users, MapPin, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './DashboardModal.css';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { transactions, updateTransactionStatus } = useCart();
  const { t } = useLanguage();

  if (!isOpen || !user) return null;

  const userTransactions = transactions.filter(tr => tr.userId === user.id);
  const totalSpent = userTransactions.reduce((acc, curr) => acc + curr.total, 0);

  // Branch Manager logic: filter transactions for their branch (simulated)
  // For demo, managers see all transactions but can only manage ones relevant to them
  const pendingOrders = transactions.filter(tr => tr.status === 'pending');
  const acceptedOrders = transactions.filter(tr => tr.status === 'accepted');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'primary';
      case 'picked_up': return 'success';
      case 'completed': return 'success';
      default: return '';
    }
  };

  const renderCustomerDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <ShoppingBag className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{userTransactions.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <DollarSign className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">{formatPrice(totalSpent)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>My Orders</h3>
        <div className="activity-list">
          {userTransactions.length > 0 ? (
            userTransactions.map(tr => (
              <div key={tr.id} className="activity-item">
                <div className="activity-icon"><Package size={16} /></div>
                <div className="activity-details">
                  <p className="activity-title">Order #{tr.id.slice(-6)} <span className={`badge ${getStatusColor(tr.status)}`}>{tr.status.replace('_', ' ').toUpperCase()}</span></p>
                  <p className="activity-time">{new Date(tr.date).toLocaleString()} • Pickup: {tr.pickupBranch}</p>
                </div>
                <div className="activity-amount">
                  <p className="main-price">{formatPrice(tr.total)}</p>
                  <p className="deposit-price">Deposit: {formatPrice(tr.depositPaid || 0)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderBranchManagerDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-stats-grid">
        <div className="stat-card warning">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">{pendingOrders.length}</span>
          </div>
        </div>
        <div className="stat-card primary">
          <CheckCircle2 className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Accepted</span>
            <span className="stat-value">{acceptedOrders.length}</span>
          </div>
        </div>
        <div className="stat-card success">
          <TrendingUp className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Today's Sales</span>
            <span className="stat-value">{formatPrice(450000)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Incoming Pick-up Requests</h3>
        <div className="activity-list">
          {pendingOrders.length > 0 ? (
            pendingOrders.map(tr => (
              <div key={tr.id} className="activity-item">
                <div className="activity-details">
                  <p className="activity-title">Order #{tr.id.slice(-6)} - {tr.items.length} items</p>
                  <p className="activity-time">{new Date(tr.date).toLocaleString()} • Deposit Paid: {formatPrice(tr.depositPaid || 0)}</p>
                  <div className="item-preview">
                    {tr.items.map(item => item.name).join(', ')}
                  </div>
                </div>
                <div className="activity-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => updateTransactionStatus(tr.id, 'accepted')}
                  >
                    Accept Order
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No pending orders.</p>
          )}
        </div>
      </div>

      <div className="dashboard-section" style={{marginTop: '30px'}}>
        <h3>Orders Ready for Pick-up</h3>
        <div className="activity-list">
          {acceptedOrders.length > 0 ? (
            acceptedOrders.map(tr => (
              <div key={tr.id} className="activity-item">
                <div className="activity-details">
                  <p className="activity-title">Order #{tr.id.slice(-6)} - {formatPrice(tr.total)}</p>
                  <p className="activity-time">Collect balance: {formatPrice(tr.total - (tr.depositPaid || 0))}</p>
                </div>
                <div className="activity-actions">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => updateTransactionStatus(tr.id, 'picked_up')}
                  >
                    Mark as Picked Up
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No orders ready.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderCEODashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-stats-grid">
        <div className="stat-card primary">
          <BarChart3 className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{formatPrice(12450000)}</span>
          </div>
        </div>
        <div className="stat-card warning">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Global Pending</span>
            <span className="stat-value">{transactions.filter(t => t.status === 'pending').length}</span>
          </div>
        </div>
        <div className="stat-card success">
          <Package className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{transactions.length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Company-Wide Order Status</h3>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Branch</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 10).map(tr => (
              <tr key={tr.id}>
                <td>#{tr.id.slice(-6)}</td>
                <td>{tr.pickupBranch}</td>
                <td>{formatPrice(tr.total)}</td>
                <td><span className={`badge ${getStatusColor(tr.status)}`}>{tr.status.toUpperCase()}</span></td>
                <td>{new Date(tr.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="dashboard-overlay" onClick={onClose}>
      <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="user-avatar-large">
              {user.fullName.charAt(0)}
            </div>
            <div className="user-info-text">
              <h4>{user.fullName}</h4>
              <span className="role-tag">{user.role.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active"><PieChart size={18} /> Overview</button>
            <button className="nav-item"><User size={18} /> Profile Settings</button>
            {user.role === 'CEO' && <button className="nav-item"><BarChart3 size={18} /> Reports</button>}
            <button className="nav-item" onClick={() => { logout(); onClose(); }}>
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h2>Dashboard Overview</h2>
            <button className="dashboard-close" onClick={onClose}><X size={24} /></button>
          </div>

          {user.role === 'customer' && renderCustomerDashboard()}
          {user.role === 'branch_manager' && renderBranchManagerDashboard()}
          {user.role === 'CEO' && renderCEODashboard()}
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
