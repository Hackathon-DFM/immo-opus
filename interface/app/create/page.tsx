'use client';

import { MultiStepForm } from '@/components/create-project/multi-step-form';

export default function CreateProject() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Project</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Launch your token with IMMO's market making capabilities</p>
      <MultiStepForm />
    </div>
  );
}