import React, { useState, useMemo } from 'react';
import { X, User, ShoppingBag, PieChart, BarChart3, Settings, LogOut, Package, Users, MapPin, TrendingUp, DollarSign, Clock, CheckCircle2, Edit3, Save, ClipboardList, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStock } from '../context/StockContext';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../hooks/useProducts';
import './DashboardModal.css';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose }) => {
  const { user, users, logout } = useAuth();
  const { transactions, updateTransactionStatus, assignOrderToStaff } = useCart();
  const { branchStock, updateStock } = useStock();
  const { allProducts } = useProducts();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'orders' | 'assignments'>('overview');
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [tempStockValue, setEditingStockValue] = useState<number>(0);
  const [selectedStaffId, setSelectedStaffId] = useState<Record<string, string>>({});

  if (!isOpen || !user) return null;

  const branchId = user.assignedBranchId || '1';
  const isManager = user.role === 'branch_manager';
  const isStaff = user.role === 'branch_staff';
  const isCEO = user.role === 'CEO';

  const userTransactions = transactions.filter(tr => tr.userId === user.id);
  const totalSpent = useMemo(() => userTransactions.reduce((acc, tr) => acc + tr.total, 0), [userTransactions]);
  
  const branchMapping: Record<string, string> = {
    'Simba City Center (UTC)': '1',
    'Simba Gishushu': '2',
    'Simba Nyarutarama': '3',
    'Simba Kimironko': '4',
    'Simba Kicukiro': '5',
    'Simba Nyamirambo': '6',
    'Simba Kimihurura': '7',
    'Simba Kanombe': '8',
    'Simba Gisozi': '9',
    'Simba Gisenyi': '10',
  };

  // Branch Manager View: All orders for this branch
  const branchOrders = transactions.filter(tr => {
    return branchMapping[tr.pickupBranch || ''] === branchId;
  });

  // Staff View: Orders assigned to this user
  const assignedToMe = transactions.filter(tr => tr.assignedStaffId === user.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'picked_up': return 'status-completed';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const currentBranchStock = branchStock.filter(s => s.branchId === branchId);
  
  // Real staff from the users list
  const availableStaff = users.filter(u => u.role === 'branch_staff' && u.assignedBranchId === branchId);

  const handleSaveStock = (productId: number) => {
    updateStock(branchId, productId, tempStockValue);
    setEditingStockId(null);
  };

  const handleAssign = (trId: string) => {
    const staffId = selectedStaffId[trId];
    if (staffId) {
      assignOrderToStaff(trId, staffId);
    }
  };

  const renderStockManagement = () => (
    <div className="dashboard-content">
      <div className="dashboard-section">
        <h3>Inventory Management (Branch #{branchId})</h3>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentBranchStock.slice(0, 20).map((stock) => {
              const product = allProducts.find((p) => p.id === stock.productId) || { name: `Product ${stock.productId}` };
              return (
                <tr key={stock.productId}>
                  <td>{product.name}</td>
                  <td>
                    {editingStockId === stock.productId ? (
                      <input 
                        type="number" 
                        value={tempStockValue} 
                        onChange={(e) => setEditingStockValue(parseInt(e.target.value) || 0)}
                        className="stock-edit-input"
                        autoFocus
                      />
                    ) : (
                      stock.stockLevel
                    )}
                  </td>
                  <td>
                    <span className={`badge ${stock.stockLevel < 10 ? 'warning' : 'success'}`}>
                      {stock.stockLevel < 10 ? 'Low' : 'Good'}
                    </span>
                  </td>
                  <td>
                    {editingStockId === stock.productId ? (
                      <button className="icon-btn save-btn" onClick={() => handleSaveStock(stock.productId)}>
                        <Save size={16} />
                      </button>
                    ) : (
                      <button className="icon-btn edit-btn" onClick={() => {
                        setEditingStockId(stock.productId);
                        setEditingStockValue(stock.stockLevel);
                      }}>
                        <Edit3 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBranchManagerDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Branch Orders</span>
            <span className="stat-value">{branchOrders.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <ClipboardList className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Needs Assignment</span>
            <span className="stat-value">{branchOrders.filter(o => o.status === 'pending' || !o.assignedStaffId).length}</span>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Branch Revenue</span>
            <span className="stat-value">{formatPrice(branchOrders.reduce((acc, o) => acc + o.total, 0))}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Manage Orders & Assignment</h3>
        <div className="activity-list">
          {branchOrders.map(tr => (
            <div key={tr.id} className="activity-item">
              <div className="activity-details">
                <p className="activity-title">
                  Order #{tr.id.slice(-6)} 
                  <span className={`badge ${getStatusColor(tr.status)}`}>{tr.status.toUpperCase()}</span>
                </p>
                <p className="activity-time">{new Date(tr.date).toLocaleString()} • {tr.items.length} items</p>
                {tr.assignedStaffId && (
                  <p className="staff-info">Assigned to: <strong>{users.find(s => s.id === tr.assignedStaffId)?.fullName || tr.assignedStaffId}</strong></p>
                )}
              </div>
              <div className="activity-actions">
                {tr.status === 'pending' && (
                  <div className="assignment-control">
                    <select 
                      value={selectedStaffId[tr.id] || ''} 
                      onChange={(e) => setSelectedStaffId({...selectedStaffId, [tr.id]: e.target.value})}
                    >
                      <option value="">Select Staff</option>
                      {availableStaff.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                    </select>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAssign(tr.id)}
                      disabled={!selectedStaffId[tr.id]}
                    >
                      Assign
                    </button>
                  </div>
                )}
                {tr.status === 'ready' && (
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => updateTransactionStatus(tr.id, 'picked_up')}
                  >
                    Mark Picked Up
                  </button>
                )}
              </div>
            </div>
          ))}
          {branchOrders.length === 0 && <p className="no-data">No orders for this branch.</p>}
        </div>
      </div>
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-stats-grid">
        <div className="stat-card primary">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Assigned Orders</span>
            <span className="stat-value">{assignedToMe.filter(o => o.status === 'preparing').length}</span>
          </div>
        </div>
        <div className="stat-card success">
          <CheckCircle className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Ready for Pickup</span>
            <span className="stat-value">{assignedToMe.filter(o => o.status === 'ready').length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>My Worklist</h3>
        <div className="activity-list">
          {assignedToMe.map(tr => (
            <div key={tr.id} className="activity-item">
              <div className="activity-details">
                <p className="activity-title">
                  Order #{tr.id.slice(-6)} 
                  <span className={`badge ${getStatusColor(tr.status)}`}>{tr.status.toUpperCase()}</span>
                </p>
                <div className="item-preview">
                  {tr.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                </div>
              </div>
              <div className="activity-actions">
                {tr.status === 'preparing' && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => updateTransactionStatus(tr.id, 'ready')}
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          ))}
          {assignedToMe.length === 0 && <p className="no-data">No orders assigned to you yet.</p>}
        </div>
      </div>
    </div>
  );

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
          {userTransactions.map(tr => (
            <div key={tr.id} className="activity-item">
              <div className="activity-icon"><Package size={16} /></div>
              <div className="activity-details">
                <p className="activity-title">
                  Order #{tr.id.slice(-6)} 
                  <span className={`badge ${getStatusColor(tr.status)}`}>{tr.status.toUpperCase()}</span>
                </p>
                <p className="activity-time">{new Date(tr.date).toLocaleString()} • Branch: {tr.pickupBranch}</p>
                {tr.status === 'ready' && <p className="ready-alert">🔥 READY FOR PICKUP!</p>}
              </div>
              <div className="activity-amount">
                <p className="main-price">{formatPrice(tr.total)}</p>
              </div>
            </div>
          ))}
          {userTransactions.length === 0 && <p className="no-data">No orders yet.</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-overlay" onClick={onClose}>
      <div className="dashboard-modal glass-effect animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="user-avatar-large">{user.fullName.charAt(0)}</div>
            <div className="user-info-text">
              <h4>{user.fullName}</h4>
              <span className="role-tag">{user.role.replace('_', ' ')}</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <PieChart size={18} /> Overview
            </button>
            {isManager && (
              <button 
                className={`nav-item ${activeTab === 'stock' ? 'active' : ''}`}
                onClick={() => setActiveTab('stock')}
              >
                <Package size={18} /> Manage Stock
              </button>
            )}
            <button className="nav-item logout-item" onClick={() => { logout(); onClose(); }}>
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </nav>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <button className="dashboard-close" onClick={onClose}><X size={20} /></button>
          </div>

          {activeTab === 'overview' && (
            user.role === 'customer' ? renderCustomerDashboard() : 
            user.role === 'branch_manager' ? renderBranchManagerDashboard() :
            user.role === 'branch_staff' ? renderStaffDashboard() : null
          )}
          {activeTab === 'stock' && isManager && renderStockManagement()}
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
