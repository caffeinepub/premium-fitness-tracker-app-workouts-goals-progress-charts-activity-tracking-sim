import { useState } from 'react';
import { useMeals, useSaveMeal, useDeleteMeal } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Utensils, Camera, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { estimateNutrition } from '../lib/nutritionEstimator';

export default function NutritionPage() {
  const { data: meals = [] } = useMeals();
  const saveMeal = useSaveMeal();
  const deleteMeal = useDeleteMeal();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Simulate AI estimation
    setIsEstimating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const estimate = estimateNutrition(file.name);
    setCalories(estimate.calories.toString());
    setProtein(estimate.protein.toString());
    setCarbs(estimate.carbs.toString());
    setFat(estimate.fat.toString());
    setFiber(estimate.fiber.toString());
    setSugar(estimate.sugar.toString());
    setSodium(estimate.sodium.toString());
    setIsEstimating(false);
    
    toast.info('AI estimate generated - please review and adjust as needed', {
      description: 'This is a simulated estimate based on common food patterns',
    });
  };

  const handleSaveMeal = async () => {
    if (!photoFile) {
      toast.error('Please upload a photo');
      return;
    }

    if (!calories || parseFloat(calories) <= 0) {
      toast.error('Please enter valid nutrition values');
      return;
    }

    try {
      const arrayBuffer = await photoFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      await saveMeal.mutateAsync({
        id: Date.now().toString(),
        photo: blob,
        nutrition: [
          parseFloat(calories) || 0,
          parseFloat(carbs) || 0,
          parseFloat(protein) || 0,
          parseFloat(fat) || 0,
          parseFloat(fiber) || 0,
          parseFloat(sugar) || 0,
          parseFloat(sodium) || 0,
        ],
      });

      toast.success('Meal saved successfully!');
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save meal');
      console.error(error);
    }
  };

  const resetForm = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('');
    setSugar('');
    setSodium('');
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await deleteMeal.mutateAsync(id);
      toast.success('Meal deleted');
    } catch (error) {
      toast.error('Failed to delete meal');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Nutrition</h1>
          <p className="text-muted-foreground">Track your meals and calories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Meal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="photo">Food Photo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-chart-1 transition-colors cursor-pointer">
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label htmlFor="photo" className="cursor-pointer">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    ) : (
                      <div className="space-y-2">
                        <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload food photo</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {isEstimating && (
                <div className="flex items-center gap-2 text-chart-1 bg-chart-1/10 p-3 rounded-lg">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-medium">Analyzing nutrition...</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugar">Sugar (g)</Label>
                  <Input
                    id="sugar"
                    type="number"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sodium">Sodium (mg)</Label>
                <Input
                  id="sodium"
                  type="number"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                <Sparkles className="w-4 h-4 inline mr-1" />
                AI estimates are simulated and should be reviewed before saving
              </div>

              <Button onClick={handleSaveMeal} className="w-full" disabled={saveMeal.isPending}>
                {saveMeal.isPending ? 'Saving...' : 'Save Meal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {meals.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <Utensils className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No meals tracked yet</h3>
              <p className="text-muted-foreground">Start logging your nutrition to reach your goals</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.slice().reverse().map((meal) => (
            <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video bg-accent/20 relative">
                <img
                  src={meal.photo.getDirectURL()}
                  alt="Meal"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  onClick={() => handleDeleteMeal(meal.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Calories</p>
                    <p className="font-semibold">{Math.round(meal.calories)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Protein</p>
                    <p className="font-semibold">{Math.round(meal.protein)}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carbs</p>
                    <p className="font-semibold">{Math.round(meal.carbs)}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fat</p>
                    <p className="font-semibold">{Math.round(meal.fat)}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
