"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { AnalyticsStats } from "@/components/dashboard/stat-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, LogOut, FileBarChart, Settings, Bell, Search, Circle, X, Loader2, Monitor, Smartphone, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEPARTMENTS, VISIT_REASONS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, deleteDoc } from 'firebase/firestore';
import { Visit } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [filterCollege, setFilterCollege] = useState<string>("all");
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/admin/login');
      } else {
        checkAdminRole(user.uid);
      }
    }
  }, [user, isUserLoading]);

  const checkAdminRole = async (uid: string) => {
    const docSnap = await getDoc(doc(firestore, 'users', uid));
    if (docSnap.exists() && docSnap.data().role === 'admin') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      router.push('/');
    }
  };

  const sessionsQuery = useMemoFirebase(() => {
    if (!isAuthorized) return null;
    return collection(firestore, 'user_sessions');
  }, [firestore, isAuthorized]);
  const { data: sessions, isLoading: isSessionsLoading } = useCollection(sessionsQuery);

  const visitsQuery = useMemoFirebase(() => {
    if (!isAuthorized) return null;
    return collection(firestore, 'visits');
  }, [firestore, isAuthorized]);
  const { data: visits, isLoading: isVisitsLoading } = useCollection<Visit>(visitsQuery);

  const handleLogout = async () => {
    if (user) {
      await deleteDoc(doc(firestore, 'user_sessions', user.uid));
    }
    await signOut(auth);
    router.push('/');
  };

  const filteredVisits = useMemo(() => {
    if (!visits) return [];
    return visits.filter(v => {
      const matchCollege = filterCollege === "all" || v.college === filterCollege;
      const matchPurpose = filterPurpose === "all" || v.purpose === filterPurpose;
      const matchUserType = filterUserType === "all" || v.userType === filterUserType;
      return matchCollege && matchPurpose && matchUserType;
    });
  }, [visits, filterCollege, filterPurpose, filterUserType]);

  const stats = useMemo(() => {
    const total = filteredVisits.length;
    const students = filteredVisits.filter(v => v.userType === 'student').length;
    const employees = filteredVisits.filter(v => v.userType === 'employee').length;
    return { total, students, employees };
  }, [filteredVisits]);

  const resetFilters = () => {
    setFilterCollege("all");
    setFilterPurpose("all");
    setFilterUserType("all");
  };

  const simulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  if (isUserLoading || isAuthorized === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f8fafc] font-body">
        <Sidebar className="border-r shadow-2xl bg-white">
          <SidebarHeader className="p-8 border-b">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 hover:rotate-6 transition-transform">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                  alt="NEU Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-primary text-xl leading-tight tracking-tighter">NEU</span>
                <span className="text-[10px] font-black text-accent tracking-[0.3em]">CAMPLIB</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4 space-y-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Dashboard" className="h-12 rounded-xl transition-all hover:pl-4">
                  <LayoutDashboard className="h-5 w-5" /> <span className="font-semibold">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push('/admin/users')} tooltip="Users" className="h-12 rounded-xl transition-all hover:pl-4">
                  <Users className="h-5 w-5" /> <span className="font-semibold">Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Reports" className="h-12 rounded-xl transition-all hover:pl-4">
                  <FileBarChart className="h-5 w-5" /> <span className="font-semibold">Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" className="h-12 rounded-xl transition-all hover:pl-4">
                  <Settings className="h-5 w-5" /> <span className="font-semibold">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-auto pt-20 px-4 pb-8">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl h-12 transition-all"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" /> Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-10 border-b border-slate-100">
            <div className="flex items-center gap-6 w-1/2">
              <div className="relative w-full max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input 
                  placeholder="Search live records..." 
                  className="w-full pl-12 bg-slate-100/50 border-none h-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-accent/30 outline-none text-sm font-medium transition-all focus:bg-white" 
                />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
                {sessions?.length || 0} Live Users
              </div>
              <button className="relative p-2.5 text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive border-2 border-white rounded-full" />
              </button>
              <div className="flex items-center gap-4 border-l border-slate-100 pl-8 group cursor-pointer">
                <div className="text-right transition-transform group-hover:-translate-x-1">
                  <p className="text-sm font-black text-primary tracking-tight">{user?.email?.split('@')[0]}</p>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Admin</p>
                </div>
                <div className="w-12 h-12 bg-accent rounded-[1rem] border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xl uppercase transition-transform group-hover:scale-105 group-hover:rotate-3">
                  {user?.email?.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div className="p-10 space-y-10 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-primary font-headline tracking-tighter">Library Insights</h1>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={simulateRefresh} 
                    className={cn("h-10 w-10 rounded-xl", isRefreshing && "animate-spin")}
                  >
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                <p className="text-muted-foreground font-medium">Real-time tracking of institutional library activity.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-5 bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">College</span>
                  <Select value={filterCollege} onValueChange={setFilterCollege}>
                    <SelectTrigger className="w-[200px] h-11 text-xs rounded-xl font-bold bg-slate-50 border-none">
                      <SelectValue placeholder="All Colleges" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="font-bold">All Colleges</SelectItem>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">Purpose</span>
                  <Select value={filterPurpose} onValueChange={setFilterPurpose}>
                    <SelectTrigger className="w-[200px] h-11 text-xs rounded-xl font-bold bg-slate-50 border-none">
                      <SelectValue placeholder="All Purposes" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="font-bold">All Purposes</SelectItem>
                      {VISIT_REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                   <span className="text-[10px] opacity-0">Action</span>
                   <Button 
                    variant="ghost" 
                    onClick={resetFilters} 
                    className="h-11 px-5 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                   >
                    <X className="mr-2 h-4 w-4" /> Reset
                   </Button>
                </div>
              </div>
            </div>

            <AnalyticsStats 
              activeCount={sessions?.length || 0} 
              totalVisitors={stats.total}
              studentCount={stats.students}
              employeeCount={stats.employees}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 overflow-hidden rounded-[2.5rem] bg-white">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-8">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Recent Verified Activity</CardTitle>
                    <CardDescription className="text-base">Real-time visitation stream matching filters.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-accent/10 text-accent font-bold px-4 py-1.5 rounded-full animate-pulse">
                    LIVE STREAM
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-8 py-5 text-[10px] uppercase tracking-widest font-black">Visitor</TableHead>
                        <TableHead className="py-5 text-[10px] uppercase tracking-widest font-black">Type</TableHead>
                        <TableHead className="py-5 text-[10px] uppercase tracking-widest font-black">College</TableHead>
                        <TableHead className="py-5 text-[10px] uppercase tracking-widest font-black text-right pr-8">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isVisitsLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/30" />
                          </TableCell>
                        </TableRow>
                      ) : filteredVisits.length > 0 ? (
                        filteredVisits.slice(0, 10).map((visit, idx) => (
                          <TableRow key={visit.id} className="group hover:bg-slate-50 transition-all duration-300 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                            <TableCell className="pl-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-[1rem] bg-accent/10 flex items-center justify-center text-sm font-black text-accent group-hover:scale-110 transition-transform">
                                  {visit.userName?.charAt(0) || 'V'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-primary">{visit.userName}</span>
                                  <span className="text-[10px] text-muted-foreground font-medium">{visit.userEmail}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-white border-2">
                                {visit.userType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-medium text-xs">
                              {visit.college}
                            </TableCell>
                            <TableCell className="text-right pr-8">
                              <span className="text-xs font-bold text-primary bg-slate-100 px-3 py-1.5 rounded-lg">
                                {visit.timestamp?.toDate ? visit.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center text-muted-foreground font-medium italic">
                            No active records match your criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-100">
                  <CardTitle className="text-2xl font-bold tracking-tight">Active Sessions</CardTitle>
                  <CardDescription className="text-base">Users currently logged in.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="max-h-[600px] overflow-auto p-6 space-y-4">
                     {isSessionsLoading ? (
                       <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary/30 h-8 w-8" /></div>
                     ) : sessions && sessions.length > 0 ? (
                       sessions.map((session: any, idx: number) => (
                        <div key={session.id} className="p-5 bg-slate-50/80 rounded-[1.5rem] flex items-start gap-4 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-500 animate-in fade-in zoom-in-95" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className="relative">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg transition-transform group-hover:rotate-6">
                              {session.name?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black truncate text-primary">{session.name}</p>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold mt-2">
                              <span className="flex items-center gap-1">
                                {session.device === 'Mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                                {session.device}
                              </span>
                              <span className="flex items-center gap-1">
                                <Circle className="h-1.5 w-1.5 fill-accent text-accent" />
                                {new Date(session.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                       ))
                     ) : (
                       <div className="text-center py-20 px-8">
                         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Users className="h-8 w-8 text-slate-300" />
                         </div>
                         <p className="text-sm text-muted-foreground font-bold">No live sessions found.</p>
                       </div>
                     )}
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
