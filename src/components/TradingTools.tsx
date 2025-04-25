'use client'

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Info, 
  ArrowRight, 
  CornerRightDown, 
  Minus, 
  ArrowRight as HorizontalRay, 
  LineVertical,
  Plus,
  LayoutGrid,
  LineChart,
  MoveHorizontal,
  Network,
  GitFork,
  GitMerge,
  GitPullRequestDraft,
  GitBranchPlus
} from 'lucide-react';

export type DrawingTool = 
  'none' | 
  'trendLine' | 
  'ray' | 
  'infoLine' | 
  'extendedLine' | 
  'trendAngle' | 
  'horizontalLine' | 
  'horizontalRay' | 
  'verticalLine' | 
  'crossLine' |
  'parallelChannel' |
  'regressionTrend' |
  'flatChannel' |
  'disjointChannel' |
  'pitchfork' |
  'schiffPitchfork' |
  'modifiedSchiffPitchfork' |
  'insidePitchfork';

interface TradingToolsProps {
  onSelectTool: (tool: DrawingTool) => void;
  activeTool: DrawingTool;
  onClearDrawings?: () => void;
}

const TradingTools: React.FC<TradingToolsProps> = ({ 
  onSelectTool, 
  activeTool,
  onClearDrawings
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  
  const toggleToolbar = () => {
    setShowToolbar(!showToolbar);
  };
  
  const handleSelectTool = (tool: DrawingTool) => {
    onSelectTool(tool);
    // Don't auto-hide the toolbar when a tool is selected
  };
  
  return (
    <div className="relative">
      {/* Toolbar toggle button */}
      <button 
        onClick={toggleToolbar}
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded flex items-center"
      >
        <LineChart size={16} />
        <span className="ml-2 text-sm">Drawing Tools</span>
      </button>
      
      {/* Toolbar panel */}
      {showToolbar && (
        <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded p-2 w-64 z-50">
          {/* Lines Category */}
          <div className="mb-3">
            <h3 className="text-xs text-gray-400 mb-1 pb-1 border-b border-gray-700">LINES</h3>
            <div className="grid grid-cols-2 gap-1">
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'trendLine' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('trendLine')}
              >
                <TrendingUp size={14} className="mr-2" />
                <span>Trend Line</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'ray' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('ray')}
              >
                <ArrowUpRight size={14} className="mr-2" />
                <span>Ray</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'infoLine' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('infoLine')}
              >
                <Info size={14} className="mr-2" />
                <span>Info Line</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'extendedLine' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('extendedLine')}
              >
                <ArrowRight size={14} className="mr-2" />
                <span>Extended Line</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'trendAngle' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('trendAngle')}
              >
                <CornerRightDown size={14} className="mr-2" />
                <span>Trend Angle</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'horizontalLine' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('horizontalLine')}
              >
                <Minus size={14} className="mr-2" />
                <span>Horizontal Line</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'horizontalRay' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('horizontalRay')}
              >
                <HorizontalRay size={14} className="mr-2" />
                <span>Horizontal Ray</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'verticalLine' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('verticalLine')}
              >
                <LineVertical size={14} className="mr-2" />
                <span>Vertical Line</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'crossLine' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('crossLine')}
              >
                <Plus size={14} className="mr-2" />
                <span>Cross Line</span>
              </button>
            </div>
          </div>
          
          {/* Channels Category */}
          <div className="mb-3">
            <h3 className="text-xs text-gray-400 mb-1 pb-1 border-b border-gray-700">CHANNELS</h3>
            <div className="grid grid-cols-2 gap-1">
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'parallelChannel' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('parallelChannel')}
              >
                <LayoutGrid size={14} className="mr-2" />
                <span>Parallel Channel</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'regressionTrend' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('regressionTrend')}
              >
                <LineChart size={14} className="mr-2" />
                <span>Regression Trend</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'flatChannel' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('flatChannel')}
              >
                <MoveHorizontal size={14} className="mr-2" />
                <span>Flat Top/Bottom</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'disjointChannel' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('disjointChannel')}
              >
                <Network size={14} className="mr-2" />
                <span>Disjoint Channel</span>
              </button>
            </div>
          </div>
          
          {/* Pitchforks Category */}
          <div className="mb-3">
            <h3 className="text-xs text-gray-400 mb-1 pb-1 border-b border-gray-700">PITCHFORKS</h3>
            <div className="grid grid-cols-2 gap-1">
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'pitchfork' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('pitchfork')}
              >
                <GitFork size={14} className="mr-2" />
                <span>Pitchfork</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'schiffPitchfork' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('schiffPitchfork')}
              >
                <GitMerge size={14} className="mr-2" />
                <span>Schiff Pitchfork</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'modifiedSchiffPitchfork' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('modifiedSchiffPitchfork')}
              >
                <GitPullRequestDraft size={14} className="mr-2" />
                <span>Modified Schiff</span>
              </button>
              <button 
                className={`flex items-center p-2 rounded text-xs ${activeTool === 'insidePitchfork' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                onClick={() => handleSelectTool('insidePitchfork')}
              >
                <GitBranchPlus size={14} className="mr-2" />
                <span>Inside Pitchfork</span>
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-between mt-2 border-t border-gray-700 pt-2">
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded"
              onClick={() => handleSelectTool('none')}
            >
              Select Mode
            </button>
            <button
              className="bg-red-700 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
              onClick={onClearDrawings}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingTools; 