import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how JunkYard Pro looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Theme</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex-1 min-w-[100px]"
                  data-testid="button-theme-light"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex-1 min-w-[100px]"
                  data-testid="button-theme-dark"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="flex-1 min-w-[100px]"
                  data-testid="button-theme-system"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Defaults</CardTitle>
            <CardDescription>
              Configure default values for new inventory items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Show warnings when items fall below threshold
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-low-stock-alerts" />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Auto-generate SKU</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate SKU codes for new items
                </p>
              </div>
              <Switch data-testid="switch-auto-sku" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Application information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono" data-testid="text-app-version">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-mono">Development</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
