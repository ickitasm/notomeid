/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SettingsView, SettingsViewProps } from './Settings/SettingsView';

export interface SettingsModalProps extends Omit<SettingsViewProps, 'onBack'> {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ...props
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#FAF7F2] dark:bg-[#161311] rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <SettingsView onBack={onClose} {...props} />
      </div>
    </div>
  );
};

export { SettingsView };
