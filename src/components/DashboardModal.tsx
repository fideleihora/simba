import React, { useState, useMemo } from 'react';
import { X, User, ShoppingBag, PieChart, BarChart3, Settings, LogOut, Package, Users, MapPin, TrendingUp, DollarSign, Clock, CheckCircle2, Edit3, Save, ClipboardList, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStock } from '../context/StockContext';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../hooks/useProducts';
import { branches as branchesList, getBranchIdByName } from '../data/branches';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'orders' | 'assignments' | 'users' | 'branches'>('overview');
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

  // Branch Manager View: All orders for this branch
  const branchOrders = transactions.filter(tr => {
    return getBranchIdByName(tr.pickupBranch || '') === branchId;
  });

  // CEO View: Aggregate stats
  const totalRevenue = transactions.reduce((acc, tr) => acc + tr.total, 0);
  const totalOrders = transactions.length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;

  const branchPerformance = branchesList.map(b => {
    const orders = transactions.filter(tr => getBranchIdByName(tr.pickupBranch || '') === b.id);
    const revenue = orders.reduce((acc, tr) => acc + tr.total, 0);
    return { ...b, orders: orders.length, revenue };
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
        <div className="section-header">
          <h3>Inventory Management (Branch #{branchId})</h3>
          <p>Update stock levels for products at your branch.</p>
        </div>
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

  const renderUserManagement = () => {
    const filteredUsers = isCEO 
      ? users 
      : users.filter(u => u.assignedBranchId === branchId && (u.role === 'branch_staff' || u.role === 'customer'));

    return (
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>User Management</h3>
            <p>{isCEO ? 'Overview of all users in the system' : `Manage staff and customers for Branch #${branchId}`}</p>
          </div>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{u.fullName.charAt(0)}</div>
                      <span>{u.fullName}</span>
                    </div>
                  </td>
                  <td><span className="role-tag-small">{u.role.replace('_', ' ')}</span></td>
                  <td>{u.phoneNumber}</td>
                  <td>{u.assignedBranchId ? branchesList.find(b => b.id === u.assignedBranchId)?.name : 'N/A'}</td>
                  <td><span className="badge success">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCEODashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-stats-grid">
        <div className="stat-card primary">
          <TrendingUp className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{formatPrice(totalRevenue)}</span>
          </div>
        </div>
        <div className="stat-card">
          <ShoppingBag className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{totalOrders}</span>
          </div>
        </div>
        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Customers</span>
            <span className="stat-value">{totalCustomers}</span>
          </div>
        </div>
        <div className="stat-card">
          <MapPin className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Active Branches</span>
            <span className="stat-value">{branchesList.length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>Branch Performance</h3>
          <div className="branch-grid">
            {branchPerformance.map(bp => (
              <div key={bp.id} className="branch-card">
                <h4>{bp.name}</h4>
                <div className="branch-stats">
                  <div className="b-stat">
                    <span>Orders</span>
                    <strong>{bp.orders}</strong>
                  </div>
                  <div className="b-stat">
                    <span>Revenue</span>
                    <strong>{formatPrice(bp.revenue)}</strong>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(bp.revenue / (totalRevenue || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Recent Global Activity</h3>
          <div className="activity-list">
            {transactions.slice(-5).reverse().map(tr => (
              <div key={tr.id} className="activity-item">
                <div className="activity-details">
                  <p className="activity-title">Order #{tr.id.slice(-6)} at {tr.pickupBranch}</p>
                  <p className="activity-time">{new Date(tr.date).toLocaleString()} • {tr.status}</p>
                </div>
                <div className="activity-amount">{formatPrice(tr.total)}</div>
              </div>
            ))}
          </div>
        </div>
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
            {isCEO && (
              <>
                <button 
                  className={`nav-item ${activeTab === 'branches' ? 'active' : ''}`}
                  onClick={() => setActiveTab('branches')}
                >
                  <MapPin size={18} /> Branches
                </button>
                <button 
                  className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users size={18} /> User Management
                </button>
              </>
            )}
            {isManager && (
              <>
                <button 
                  className={`nav-item ${activeTab === 'stock' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stock')}
                >
                  <Package size={18} /> Manage Stock
                </button>
                <button 
                  className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users size={18} /> My Staff
                </button>
              </>
            )}
            <button className="nav-item logout-item" onClick={() => { logout(); onClose(); }}>
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </nav>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}</h2>
            <button className="dashboard-close" onClick={onClose}><X size={20} /></button>
          </div>

          {activeTab === 'overview' && (
            user.role === 'customer' ? renderCustomerDashboard() : 
            user.role === 'branch_manager' ? renderBranchManagerDashboard() :
            user.role === 'branch_staff' ? renderStaffDashboard() : 
            user.role === 'CEO' ? renderCEODashboard() : null
          )}
          {activeTab === 'stock' && isManager && renderStockManagement()}
          {activeTab === 'users' && (isCEO || isManager) && renderUserManagement()}
          {activeTab === 'branches' && isCEO && renderCEODashboard()}
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
