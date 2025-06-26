import React from 'react';
import { Execution } from '../types';
import { formatPrice, formatQuantity } from '../utils/formatters';

interface ExecutionHistoryProps {
  executions: Execution[];
  loading: boolean;
}

const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  executions,
  loading,
}) => {
  const formatTime = (timestamp?: string, createdAt?: string) => {
    const timeStr = timestamp || createdAt;
    if (!timeStr) return '---';
    
    return new Date(timeStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusColor = (ordStatus?: string, execStatus?: string) => {
    const status = execStatus || ordStatus || '';
    switch (status) {
      case 'FILLED':
        return 'status-filled';
      case 'PARTIAL_FILL':
        return 'status-partial';
      case 'NEW':
        return 'status-new';
      case 'CANCELED':
        return 'status-canceled';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  };

  const getStatusText = (ordStatus?: string, execStatus?: string) => {
    const status = execStatus || ordStatus || '';
    switch (status) {
      case 'FILLED':
        return '約定';
      case 'PARTIAL_FILL':
        return '部分約定';
      case 'NEW':
        return '新規';
      case 'CANCELED':
        return '取消';
      case 'REJECTED':
        return '拒否';
      default:
        return status || '不明';
    }
  };

  console.log('📊 ExecutionHistory状態:', { loading, executionsCount: executions.length });

  return (
    <div className="execution-history">
      <h3 className="history-title">約定履歴</h3>
      
      {loading && executions.length === 0 && (
        <div className="history-loading">約定履歴を読み込み中...</div>
      )}
      
      {!loading && executions.length === 0 && (
        <div className="no-executions">約定履歴がありません</div>
      )}
      
      {executions.length > 0 && (
        <div className="execution-table">
          <div className="table-header">
            <div className="col-time">時刻</div>
            <div className="col-symbol">商品</div>
            <div className="col-side">売買</div>
            <div className="col-quantity">数量</div>
            <div className="col-price">価格</div>
            <div className="col-status">ステータス</div>
          </div>
          
          <div className="table-body">
            {executions.map((execution) => (
              <div key={execution.execID} className="execution-row">
                <div className="col-time">
                  {formatTime(execution.transactTime, execution.createdAt)}
                </div>
                <div className="col-symbol">
                  {execution.symbol}
                </div>
                <div className={`col-side ${execution.side.toLowerCase()}`}>
                  {execution.side === 'BUY' ? '買い' : '売り'}
                </div>
                <div className="col-quantity">
                  {formatQuantity(execution.lastQty)}
                </div>
                <div className="col-price">
                  {formatPrice(execution.lastPx)}
                </div>
                <div className={`col-status ${getStatusColor(execution.ordStatus, execution.execStatus)}`}>
                  {getStatusText(execution.ordStatus, execution.execStatus)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionHistory;