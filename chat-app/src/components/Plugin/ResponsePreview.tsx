import React from 'react';

interface ResponsePreviewProps {
  result: any | null;
  rawResponse?: string | null; // 添加原始响应参数
  error: string | null;
  responseMapping: {
    a: {
      text: string;
      actionLabel: string;
    };
    b: {
      text: string;
      actionLabel: string;
    };
  };
}

const ResponsePreview: React.FC<ResponsePreviewProps> = ({ 
  result, 
  rawResponse,
  error,
  responseMapping
}) => {
  // 如果没有结果和错误，显示初始状态
  if (!result && !error) {
    return (
      <div>
        <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-light-gray)' }}>
          分析结果
        </h2>
        <div style={{ 
          backgroundColor: 'var(--card-bg)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-mid-gray)',
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <p>尚未进行分析</p>
          <p style={{ fontSize: 'var(--font-sm)', marginTop: 'var(--space-md)' }}>
            点击"测试分析"按钮开始分析
          </p>
        </div>
      </div>
    );
  }
  
  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-light-gray)' }}>
          分析结果
        </h2>
        <div style={{ 
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--error-color)',
          minHeight: '200px'
        }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>分析出错</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // 渲染结果预览 - 有效的结果
  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-light-gray)' }}>
        分析结果
      </h2>
      
      {/* 添加原始响应显示区域 */}
      {rawResponse && (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-lg)', 
          color: 'var(--text-white)'
        }}>
          <h3 style={{ 
            marginBottom: 'var(--space-md)',
            color: 'var(--text-light-gray)',
            fontSize: 'var(--font-md)'
          }}>
            API原始响应
          </h3>
          
          <pre style={{ 
            backgroundColor: 'var(--secondary-bg)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'auto',
            maxHeight: '200px',
            fontSize: '14px',
            fontFamily: 'monospace',
            color: 'var(--text-light-gray)'
          }}>
            {rawResponse}
          </pre>
        </div>
      )}
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-lg)'
      }}>
        {/* 原始JSON结果 */}
        <div style={{ 
          backgroundColor: 'var(--card-bg)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-white)'
        }}>
          <h3 style={{ 
            marginBottom: 'var(--space-md)',
            color: 'var(--text-light-gray)',
            fontSize: 'var(--font-md)'
          }}>
            JSON响应
          </h3>
          
          <pre style={{ 
            backgroundColor: 'var(--secondary-bg)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '14px',
            fontFamily: 'monospace',
            color: 'var(--text-light-gray)'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
        
        {/* 预览效果 */}
        <div style={{ 
          backgroundColor: 'var(--card-bg)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-white)'
        }}>
          <h3 style={{ 
            marginBottom: 'var(--space-md)',
            color: 'var(--text-light-gray)',
            fontSize: 'var(--font-md)'
          }}>
            UI效果预览
          </h3>
          
          {/* 不同类型的渲染 */}
          {result.type === 'none' ? (
            <div style={{ 
              color: 'var(--text-mid-gray)',
              textAlign: 'center',
              padding: 'var(--space-lg)',
              backgroundColor: 'var(--secondary-bg)',
              borderRadius: 'var(--radius-md)'
            }}>
              无需处理 - 不会显示提示
            </div>
          ) : (
            <div style={{ 
              backgroundColor: 'var(--secondary-bg)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {/* 渲染提示信息 */}
              <p style={{ 
                marginBottom: 'var(--space-sm)',
                color: 'var(--brand-color)',
                fontWeight: 'bold'
              }}>
                {result.type === 'a' 
                  ? responseMapping.a.text 
                  : responseMapping.b.text}
              </p>
              
              {/* 渲染预填充的输入 */}
              <div style={{ 
                backgroundColor: 'var(--card-bg)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-md)',
                color: 'var(--text-light-gray)'
              }}>
                {result.type === 'a' ? (
                  <span>产品：{result.suggestion.input.product}，目标客户：{result.suggestion.input.position}</span>
                ) : (
                  <span>产品：{result.suggestion.input.product}</span>
                )}
              </div>
              
              {/* 渲染按钮 */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-white)',
                    border: 'none',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  忽略
                </button>
                
                <button
                  style={{
                    backgroundColor: 'var(--brand-color)',
                    color: 'var(--text-dark)',
                    border: 'none',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {result.type === 'a' 
                    ? responseMapping.a.actionLabel 
                    : responseMapping.b.actionLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsePreview;
