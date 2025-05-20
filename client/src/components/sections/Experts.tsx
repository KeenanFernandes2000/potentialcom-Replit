import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { apiRequest } from "@/lib/queryClient";
import { LuCalendar, LuClock, LuCreditCard, LuCoins, LuInfo } from "react-icons/lu";
import { format } from "date-fns";

interface Coach {
  id: number;
  name: string;
  title: string;
  bio: string;
  expertise: string;
  imageUrl: string | null;
  hourlyRate: number | null;
  pointsCost: number | null;
  isAvailableForFree: boolean;
  isAvailableForPaid: boolean;
  isAvailableForPoints: boolean;
}

interface BookingFormData {
  coachId: number;
  sessionDate: Date;
  durationMinutes: number;
  sessionType: 'free' | 'paid' | 'points';
  notes: string;
}

const Experts = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    coachId: 0,
    sessionDate: new Date(),
    durationMinutes: 30,
    sessionType: 'free',
    notes: '',
  });
  const [userPoints, setUserPoints] = useState<number | null>(null);
  
  // Fetch coaches
  const { data: coaches = [], isLoading: isLoadingCoaches } = useQuery({
    queryKey: ['/api/coaches'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/coaches');
      if (!res.ok) throw new Error('Failed to fetch coaches');
      return res.json();
    },
  });

  // Fetch user points if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      apiRequest('GET', `/api/users/${user.id}/points`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch user points');
        })
        .then(data => setUserPoints(data.points))
        .catch(err => console.error('Error fetching user points:', err));
    }
  }, [isAuthenticated, user]);

  const handleBookSession = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to book a coaching session",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await apiRequest('POST', '/api/coaching-sessions', bookingData);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to book session');
      }

      toast({
        title: "Session Booked!",
        description: "Your coaching session has been booked successfully.",
      });
      
      setBookingOpen(false);
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book your session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openBookingDialog = (coach: Coach) => {
    setSelectedCoach(coach);
    setBookingData({
      ...bookingData,
      coachId: coach.id,
      sessionType: coach.isAvailableForFree ? 'free' : 
                  coach.isAvailableForPaid ? 'paid' : 'points',
    });
    setBookingOpen(true);
  };

  // Format currency with 2 decimal places
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Temporary placeholder coaches for UI demonstration
  const placeholderCoaches: Coach[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "AI Strategy Expert",
      bio: "10+ years helping organizations implement AI solutions with a focus on practical ROI and team enablement.",
      expertise: "AI Strategy",
      imageUrl: null,
      hourlyRate: 150,
      pointsCost: null,
      isAvailableForFree: true,
      isAvailableForPaid: true,
      isAvailableForPoints: false
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Implementation Specialist",
      bio: "Technical expert in AI agent deployment with experience across multiple industries and platforms.",
      expertise: "Technical Implementation",
      imageUrl: null,
      hourlyRate: 175,
      pointsCost: 1000,
      isAvailableForFree: false,
      isAvailableForPaid: true,
      isAvailableForPoints: true
    },
    {
      id: 3,
      name: "Alex Rivera",
      title: "Change Management Coach",
      bio: "Specializes in helping teams adopt new AI technologies through effective change management strategies.",
      expertise: "Change Management",
      imageUrl: null,
      hourlyRate: null,
      pointsCost: 800,
      isAvailableForFree: true,
      isAvailableForPaid: false,
      isAvailableForPoints: true
    }
  ];

  // Use placeholder coaches when loading or empty array is returned
  const displayCoaches = isLoadingCoaches || !coaches.length ? placeholderCoaches : coaches;

  return (
    <section id="experts" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Coaching
          </div>
          <h2 className="section-title mb-6">
            Expert Coaches
          </h2>
          <p className="text-xl text-muted-foreground">
            Book sessions with our expert coaches to accelerate your learning and implementation
          </p>
        </div>

        {isLoadingCoaches ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {displayCoaches.map((coach: Coach) => (
              <Card key={coach.id} className="glass-effect overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-16 w-16 mr-4">
                      <img 
                        src={coach.imageUrl || "/assets/default-avatar.png"} 
                        alt={coach.name}
                        className="object-cover" 
                      />
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">{coach.name}</h3>
                      <p className="text-sm text-muted-foreground">{coach.title}</p>
                      <Badge variant="outline" className="mt-1">{coach.expertise}</Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{coach.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {coach.isAvailableForFree && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                        Free Sessions
                      </Badge>
                    )}
                    {coach.isAvailableForPaid && coach.hourlyRate && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {formatCurrency(coach.hourlyRate)}/hour
                      </Badge>
                    )}
                    {coach.isAvailableForPoints && coach.pointsCost && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                        {coach.pointsCost} Points
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => openBookingDialog(coach)}
                  >
                    Book a Session
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Dialog */}
        {selectedCoach && (
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Book a Session with {selectedCoach.name}</DialogTitle>
                <DialogDescription>
                  Fill out the details below to book your coaching session
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <Tabs defaultValue={bookingData.sessionType}>
                  <TabsList className="grid w-full grid-cols-3">
                    {selectedCoach.isAvailableForFree && (
                      <TabsTrigger 
                        value="free"
                        onClick={() => setBookingData({...bookingData, sessionType: 'free'})}
                      >
                        Free
                      </TabsTrigger>
                    )}
                    {selectedCoach.isAvailableForPaid && (
                      <TabsTrigger 
                        value="paid"
                        onClick={() => setBookingData({...bookingData, sessionType: 'paid'})}
                      >
                        Paid
                      </TabsTrigger>
                    )}
                    {selectedCoach.isAvailableForPoints && (
                      <TabsTrigger 
                        value="points"
                        onClick={() => setBookingData({...bookingData, sessionType: 'points'})}
                        disabled={!userPoints || userPoints < (selectedCoach.pointsCost || 0)}
                      >
                        Points
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="free">
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <LuInfo className="mr-2" /> 
                        Free 30-minute introductory session
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="paid">
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <LuCreditCard className="mr-2" /> 
                        {selectedCoach.hourlyRate && `Rate: ${formatCurrency(selectedCoach.hourlyRate)}/hour`}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Duration</label>
                          <select 
                            className="w-full mt-1 p-2 border rounded-md"
                            value={bookingData.durationMinutes}
                            onChange={(e) => setBookingData({
                              ...bookingData, 
                              durationMinutes: parseInt(e.target.value)
                            })}
                          >
                            <option value={30}>30 minutes</option>
                            <option value={60}>60 minutes</option>
                            <option value={90}>90 minutes</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Estimated Cost</label>
                          <div className="mt-1 p-2 border rounded-md bg-muted">
                            {selectedCoach.hourlyRate ? 
                              formatCurrency((selectedCoach.hourlyRate / 60) * bookingData.durationMinutes) : 
                              'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="points">
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <LuCoins className="mr-2" /> 
                        {`Points required: ${selectedCoach.pointsCost}`}
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium mr-2">Your points:</span> 
                        <Badge variant={userPoints && userPoints >= (selectedCoach.pointsCost || 0) ? "outline" : "destructive"}>
                          {userPoints || 0}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Choose a Date and Time</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Calendar
                        mode="single"
                        selected={bookingData.sessionDate}
                        onSelect={(date) => date && setBookingData({...bookingData, sessionDate: date})}
                        disabled={(date) => date < new Date()}
                        className="border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={bookingData.sessionDate.getHours()}
                        onChange={(e) => {
                          const newDate = new Date(bookingData.sessionDate);
                          newDate.setHours(parseInt(e.target.value));
                          setBookingData({...bookingData, sessionDate: newDate});
                        }}
                      >
                        {Array.from({length: 10}, (_, i) => i + 9).map(hour => (
                          <option key={hour} value={hour}>
                            {`${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`}
                          </option>
                        ))}
                      </select>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                        <textarea
                          className="w-full p-2 border rounded-md"
                          rows={3}
                          placeholder="Any specific topics you'd like to discuss?"
                          value={bookingData.notes}
                          onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <div className="w-full flex flex-col space-y-2">
                  <div className="text-sm text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <LuCalendar className="mr-2" />
                      <span>
                        {format(bookingData.sessionDate, "EEEE, MMMM d, yyyy")} at {format(bookingData.sessionDate, "h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <LuClock className="mr-2" />
                      <span>{bookingData.durationMinutes} minutes</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleBookSession} className="w-full">
                    Confirm Booking
                  </Button>
                  
                  {!isAuthenticated && (
                    <p className="text-xs text-center text-red-500">
                      Please login to book a session
                    </p>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
};

export default Experts;