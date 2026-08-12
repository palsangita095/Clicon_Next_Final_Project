"use client";

import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthDrawer = () => {
  const { drawer, closeDrawer, activeTab, setActiveTab } = useAuthStore();

  return (
    <Dialog open={drawer} onOpenChange={closeDrawer}>
      <DialogContent className="w-[95vw] max-w-lg md:max-w-2xl lg:max-w-5xl max-h-[90vh] p-0 overflow-y-auto">
        <div className="p-6 md:p-10">
          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Welcome to Clicon
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Sign in to your account or create a new one to continue.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" onClick={() => setActiveTab("login")}>
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <LoginForm />
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDrawer;
