'use client';

import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto font-semibold">
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Wand2 />
          Get Tracks
        </>
      )}
    </Button>
  );
}

type UrlFormProps = {
  formAction: (payload: FormData) => void;
};

export function UrlForm({ formAction }: UrlFormProps) {
  return (
    <form action={formAction} className="w-full">
      <div className="flex flex-col sm:flex-row items-center gap-2 rounded-lg border bg-card p-2 focus-within:ring-2 focus-within:ring-ring transition-shadow shadow-sm">
        <Input
          type="url"
          name="url"
          placeholder="https://open.spotify.com/..."
          required
          className="h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Spotify URL"
        />
        <SubmitButton />
      </div>
    </form>
  );
}
