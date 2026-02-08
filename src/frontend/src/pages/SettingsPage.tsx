import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useUpdateProfile, useExportData, useDeleteAllData } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Download, Trash2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { SiCoffeescript } from 'react-icons/si';

export default function SettingsPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const updateProfile = useUpdateProfile();
  const exportData = useExportData();
  const deleteAllData = useDeleteAllData();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [units, setUnits] = useState<'metric' | 'imperial'>(
    userProfile?.units && typeof userProfile.units === 'object' && 'metric' in userProfile.units ? 'metric' : 'imperial'
  );

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        displayName: displayName.trim(),
        units: { [units]: null } as any,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fittrack-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      await deleteAllData.mutateAsync();
      toast.success('All data deleted successfully');
    } catch (error) {
      toast.error('Failed to delete data');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-3">
            <Label>Preferred Units</Label>
            <RadioGroup value={units} onValueChange={(v) => setUnits(v as 'metric' | 'imperial')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metric" id="metric-setting" />
                <Label htmlFor="metric-setting" className="font-normal cursor-pointer">
                  Metric (kg, km)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imperial" id="imperial-setting" />
                <Label htmlFor="imperial-setting" className="font-normal cursor-pointer">
                  Imperial (lbs, miles)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleUpdateProfile} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or delete your fitness data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleExportData}
            disabled={exportData.isPending}
          >
            <Download className="w-4 h-4" />
            {exportData.isPending ? 'Exporting...' : 'Export All Data (JSON)'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start gap-2">
                <Trash2 className="w-4 h-4" />
                Delete All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your workouts, meals, activities, and goals.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <footer className="text-center text-sm text-muted-foreground py-8">
        <p className="flex items-center justify-center gap-1">
          © 2026. Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chart-1 hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
