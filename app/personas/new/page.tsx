// File: app/personas/new/page.tsx

import PersonaForm from '../../../components/PersonaForm';

export default function NewPersonaPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Create New Persona</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Define a new character for you or others to chat with.
        </p>
      </div>
      <PersonaForm />
    </main>
  );
}