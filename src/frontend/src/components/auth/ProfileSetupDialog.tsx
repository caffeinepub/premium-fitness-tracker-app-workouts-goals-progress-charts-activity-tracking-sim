import { useState } from 'react';
import { useUpdateProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface ProfileSetupDialogProps {
  open: boolean;
}

export default function ProfileSetupDialog({ open }: ProfileSetupDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const updateProfile = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        displayName: displayName.trim(),
        units: { [units]: null } as any,
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to FitTrack Pro</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started with your fitness journey.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Your Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />
          </div>
          <div className="space-y-3">
            <Label>Preferred Units</Label>
            <RadioGroup value={units} onValueChange={(v) => setUnits(v as 'metric' | 'imperial')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric" className="font-normal cursor-pointer">
                  Metric (kg, km)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial" className="font-normal cursor-pointer">
                  Imperial (lbs, miles)
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Creating Profile...' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
