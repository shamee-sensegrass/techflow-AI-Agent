import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Palette, 
  Shield, 
  Download,
  Trash2,
  Save,
  Key,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Volume2
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || ""
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: true
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    analyticsOptIn: true,
    dataSharing: false
  });

  // Profile update mutation
  const profileUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put("/api/auth/profile", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  // Password update mutation
  const passwordUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put("/api/auth/password", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Update Failed",
        description: error.response?.data?.message || "Failed to update password",
        variant: "destructive"
      });
    }
  });

  const handleSaveProfile = () => {
    if (!profileForm.username || !profileForm.email) {
      toast({
        title: "Validation Error",
        description: "Username and email are required fields.",
        variant: "destructive"
      });
      return;
    }
    
    profileUpdateMutation.mutate(profileForm);
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All password fields are required.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    passwordUpdateMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification settings have been saved.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be emailed to you within 24 hours.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Sidebar />
      
      <main className="lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-gray-400 mt-2">
                Manage your account preferences and security settings
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px] mx-auto bg-gray-800/50 border border-gray-700">
                  <TabsTrigger value="profile" className="text-sm">Profile</TabsTrigger>
                  <TabsTrigger value="security" className="text-sm">Security</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-sm">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy" className="text-sm">Privacy</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <User className="h-5 w-5 text-blue-400" />
                        <span>Profile Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-gray-300">Username</Label>
                          <Input
                            id="username"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-300">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveProfile} 
                          disabled={profileUpdateMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {profileUpdateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <div className="space-y-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Lock className="h-5 w-5 text-green-400" />
                          <span>Password & Authentication</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleChangePassword} 
                            disabled={passwordUpdateMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Key className="h-4 w-4 mr-2" />
                            {passwordUpdateMutation.isPending ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Shield className="h-5 w-5 text-purple-400" />
                          <span>Two-Factor Authentication</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300">Enable 2FA for enhanced security</p>
                            <p className="text-sm text-gray-500">Protect your account with an additional security layer</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Bell className="h-5 w-5 text-yellow-400" />
                        <span>Notification Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-blue-400" />
                            <div>
                              <p className="text-gray-300">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive updates via email</p>
                            </div>
                          </div>
                          <Switch 
                            checked={notifications.email}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-4 w-4 text-green-400" />
                            <div>
                              <p className="text-gray-300">Push Notifications</p>
                              <p className="text-sm text-gray-500">Browser and mobile notifications</p>
                            </div>
                          </div>
                          <Switch 
                            checked={notifications.push}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Volume2 className="h-4 w-4 text-purple-400" />
                            <div>
                              <p className="text-gray-300">SMS Notifications</p>
                              <p className="text-sm text-gray-500">Text message alerts</p>
                            </div>
                          </div>
                          <Switch 
                            checked={notifications.sms}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-4 w-4 text-cyan-400" />
                            <div>
                              <p className="text-gray-300">Marketing Communications</p>
                              <p className="text-sm text-gray-500">Product updates and announcements</p>
                            </div>
                          </div>
                          <Switch 
                            checked={notifications.marketing}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button onClick={handleSaveNotifications} className="bg-yellow-600 hover:bg-yellow-700">
                          <Save className="h-4 w-4 mr-2" />
                          Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Privacy Tab */}
                <TabsContent value="privacy">
                  <div className="space-y-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Shield className="h-5 w-5 text-indigo-400" />
                          <span>Privacy Settings</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300">Public Profile</p>
                            <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                          </div>
                          <Switch 
                            checked={privacy.profileVisible}
                            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisible: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300">Analytics Opt-in</p>
                            <p className="text-sm text-gray-500">Help improve the platform with usage analytics</p>
                          </div>
                          <Switch 
                            checked={privacy.analyticsOptIn}
                            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, analyticsOptIn: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300">Data Sharing</p>
                            <p className="text-sm text-gray-500">Share anonymized data with partners</p>
                          </div>
                          <Switch 
                            checked={privacy.dataSharing}
                            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataSharing: checked }))}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Download className="h-5 w-5 text-green-400" />
                          <span>Data Management</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300">Export Your Data</p>
                            <p className="text-sm text-gray-500">Download a copy of your account data</p>
                          </div>
                          <Button onClick={handleExportData} variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/10">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300">Delete Account</p>
                            <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                          </div>
                          <Button onClick={handleDeleteAccount} variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}