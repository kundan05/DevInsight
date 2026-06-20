import React from 'react';
import { CollaborationProvider } from '../contexts/CollaborationProvider';
import IDE from '../components/workspace/IDE';

const Workspace: React.FC = () => {
  return (
    <CollaborationProvider>
      <IDE />
    </CollaborationProvider>
  );
};

export default Workspace;
