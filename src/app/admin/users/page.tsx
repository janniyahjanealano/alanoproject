"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Users, Search, Ban, CheckCircle, LogOut, FileBarChart, Settings, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_USERS, User } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function UserManagement() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') router.push('/');
  }, [router]);

  const toggleBlock = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newState = !u.isBlocked;
        toast({
          title: newState ? "User Blocked" : "User Restored",
          description: `${u.name} has been ${newState ? 'restricted from library access' : 'granted access again'}.`,
          variant: newState ? "destructive" : "default",
        });
        return { ...u, isBlocked: newState };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-2 font-bold text-primary text-xl font-headline">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">L</div>
              NEU Library
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push('/admin/dashboard')} tooltip="Dashboard">
                  <LayoutDashboard className="h-4 w-4" /> <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Users">
                  <Users className="h-4 w-4" /> <span>User Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Reports">
                  <FileBarChart className="h-4 w-4" /> <span>Analytics Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="h-4 w-4" /> <span>Library Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-auto pt-10 px-2 pb-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={() => { localStorage.clear(); router.push('/'); }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 space-y-8 min-w-0">
          <div className="flex justify-between items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary font-headline">User Management</h1>
              <p className="text-muted-foreground">Manage library institutional access and user status.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-9 h-10 shadow-sm border-none bg-white focus-visible:ring-accent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-white border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Institutional Directory</CardTitle>
                  <CardDescription>Showing {filteredUsers.length} total users</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Export CSV</Button>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">Add New User</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6">Full Name</TableHead>
                    <TableHead>Institutional Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-muted/20 transition-all">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-primary">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize font-medium ${user.role === 'admin' ? 'border-primary text-primary' : 'border-accent text-accent'}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <div className="flex items-center gap-1.5 text-destructive text-sm font-medium">
                            <Ban className="h-3.5 w-3.5" /> Restricted
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Active
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant={user.isBlocked ? "outline" : "ghost"} 
                            size="sm"
                            className={user.isBlocked ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50" : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"}
                            onClick={() => toggleBlock(user.id)}
                            disabled={user.role === 'admin'}
                          >
                            {user.isBlocked ? "Unblock" : "Block User"}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 opacity-20" />
                          <p>No users found matching your search criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
