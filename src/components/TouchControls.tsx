import React from 'react';
import { IconButton } from '@mui/material';
import { ArrowBack, ArrowForward, ArrowUpward, ArrowDownward, CheckCircle } from '@mui/icons-material';

interface TouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onUp: () => void;
  onDown: () => void;
  onEnter: () => void;
}

const TouchControls: React.FC<TouchControlsProps> = ({ onLeft, onRight, onUp, onDown, onEnter }) => {
  return (
    <div className="flex flex-col items-center gap-2 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-xl">
      <IconButton
        onClick={onUp}
        size="large"
        sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, boxShadow: 3 }}
      >
        <ArrowUpward fontSize="large" sx={{ color: 'white' }} />
      </IconButton>
      
      <div className="flex gap-2 items-center">
        <IconButton
          onClick={onLeft}
          size="large"
          sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, boxShadow: 3 }}
        >
          <ArrowBack fontSize="large" sx={{ color: 'white' }} />
        </IconButton>
        
        <IconButton
          onClick={onEnter}
          size="large"
          sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, boxShadow: 3 }}
        >
          <CheckCircle fontSize="large" sx={{ color: 'white' }} />
        </IconButton>
        
        <IconButton
          onClick={onRight}
          size="large"
          sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, boxShadow: 3 }}
        >
          <ArrowForward fontSize="large" sx={{ color: 'white' }} />
        </IconButton>
      </div>
      
      <IconButton
        onClick={onDown}
        size="large"
        sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, boxShadow: 3 }}
      >
        <ArrowDownward fontSize="large" sx={{ color: 'white' }} />
      </IconButton>
    </div>
  );
};

export default TouchControls;
