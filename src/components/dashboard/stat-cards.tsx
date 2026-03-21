import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Clock, Wifi, Briefcase, GraduationCap, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatProps {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  colorClass: string;
  delay: string;
}

function StatCard({ title, value, subValue, icon, colorClass, delay }: StatProps) {
  return (
    <Card className={cn(
      "border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 rounded-[2.5rem] bg-white group animate-in fade-in slide-in-from-bottom-4",
      delay
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-8">
        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</CardTitle>
        <div className={cn("p-3 rounded-2xl transition-all group-hover:scale-110 duration-500 group-hover:rotate-6 shadow-sm", colorClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-black text-primary tracking-tighter">{value}</div>
            <div className="text-xs font-bold text-muted-foreground mt-2 flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
               {subValue}
            </div>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-500">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsStats({ 
  activeCount = 0,
  totalVisitors = 0,
  studentCount = 0,
  employeeCount = 0
}: { 
  activeCount?: number;
  totalVisitors?: number;
  studentCount?: number;
  employeeCount?: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatCard 
        title="Live Traffic" 
        value={activeCount.toString()} 
        subValue="Currently inside" 
        icon={<Wifi size={24} className="animate-pulse" />} 
        colorClass="bg-emerald-100 text-emerald-600"
        delay="delay-0"
      />
      <StatCard 
        title="Total Analytics" 
        value={totalVisitors.toString()} 
        subValue="Visits recorded" 
        icon={<Users size={24} />} 
        colorClass="bg-blue-100 text-blue-600"
        delay="delay-75"
      />
      <StatCard 
        title="Student Reach" 
        value={studentCount.toString()} 
        subValue="Verified students" 
        icon={<GraduationCap size={24} />} 
        colorClass="bg-accent/15 text-accent"
        delay="delay-150"
      />
      <StatCard 
        title="Staff Usage" 
        value={employeeCount.toString()} 
        subValue="University staff" 
        icon={<Briefcase size={24} />} 
        colorClass="bg-orange-100 text-orange-600"
        delay="delay-300"
      />
    </div>
  );
}