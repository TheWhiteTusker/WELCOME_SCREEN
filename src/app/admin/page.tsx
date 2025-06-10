"use client"

import { useState, useEffect } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  PlusCircle,
  Trash2,
  Save,
  Users,
  Newspaper,
  AlertCircle,
  LogOut,
  KeyRound,
  User,
  Eye,
  EyeOff,
  Settings,
  Video,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { VideoManager } from "@/components/VideoManager"

type NewsItem = {
  id: number
  title: string
}

type Guest = {
  name: string
  designation: string
  department: string
}

export default function AdminPanel() {
  const [guests, setGuests] = useState<Guest[]>([
    { name: "", designation: "", department: "" },
    { name: "", designation: "", department: "" },
  ])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isNewsLoading, setIsNewsLoading] = useState(false)
  const [newNewsTitle, setNewNewsTitle] = useState("")
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchWelcomeData()
    fetchNewsData()
  }, [])

  const fetchWelcomeData = async () => {
    try {
      const response = await fetch("/api/guests");
      const data = await response.json();

      if (Array.isArray(data)) {
        setGuests(data);
      } else {
        console.error("Unexpected guests format", data);
      }
    } catch (error) {
      console.error("Error fetching welcome data", error);
    }
  };


  const fetchNewsData = async () => {
    try {
      const response = await fetch("/api/news");
      const data = await response.json();
      setNewsItems(data || []);
    } catch (error) {
      console.error("Error fetching news data", error);
    }
  };


  const handleGuestChange = async (index: number, field: keyof Guest, value: string) => {
    const updated = [...guests];
    updated[index][field] = value;
    setGuests(updated);
    console.debug("updated", value)

    try {
      await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (error) {
      console.error("Failed to live update guest", error);
    }
  };

  const handleAddGuest = async () => {
    const updated = [...guests, { name: "", designation: "", department: "" }];
    setGuests(updated);

    await fetch("/api/guests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const handleRemoveGuest = async (index: number) => {
    const updated = guests.filter((_, i) => i !== index);
    setGuests(updated);

    await fetch("/api/guests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const handleRemoveAllGuests = async () => {
    try {
      setGuests([]);
      await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([]),
      });
      toast.success("All guests removed");
    } catch (error) {
      console.error("Failed to remove all guests", error);
      toast.error("Failed to remove guests");
    }
  };

  const handleUpdateWelcome = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guests),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Welcome message updated successfully");
      fetchWelcomeData();
    } catch (error) {
      console.error("Failed to update welcome message", error);
      toast.error("Failed to update welcome message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNews = async () => {
    if (!newNewsTitle.trim()) {
      toast.error("News title cannot be empty")
      return
    }

    try {
      setIsNewsLoading(true);

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newNewsTitle }),
      });

      if (!res.ok) throw new Error("Failed to add news");

      toast.success("News item added successfully");
      setNewNewsTitle("");              // Clear input
      await fetchNewsData();            // Refresh news list ✅
    } catch (error) {
      console.error("Failed to add news", error);
      toast.error("Failed to add news item");
    } finally {
      setIsNewsLoading(false);
    }
  };

  const handleDeleteNews = async (id: number) => {
    try {
      const res = await fetch(`/api/news?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete news");

      toast.success("News item deleted successfully");
      await fetchNewsData(); // ✅ Refresh the news list
    } catch (error) {
      console.error("Failed to delete news", error);
      toast.error("Failed to delete news item");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Password changed successfully");
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.message || "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-xl">RTX</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Connected Ecosystem</h1>
              <p className="text-gray-300">Admin Dashboard</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 cursor-pointer">
                <Avatar>
                  <AvatarFallback className="bg-red-600 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowPasswordChange(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border rounded pr-10"
                  />
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded pr-10"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded pr-10"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowPasswordChange(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <Tabs defaultValue="welcome" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="welcome" className="flex items-center gap-2">
              <Users size={18} />
              <span>Welcome Guests</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper size={18} />
              <span>News Ticker</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video size={18} />
              <span>Videos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="welcome">
            <Card>
              <CardHeader>
                <CardTitle>Update Welcome Guests</CardTitle>
                <CardDescription>Manage dynamic list of guests shown on welcome screen</CardDescription>
              </CardHeader>
              <CardContent>
                {guests.length === 0 ? (
                  <div className="text-center text-gray-500 mb-4">
                    No guests added yet.
                  </div>
                ) : (
                  guests.map((guest, index) => (
                    <div key={index} className="space-y-4 border p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Guest {index + 1}</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveGuest(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={guest.name}
                            onChange={(e) => handleGuestChange(index, "name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Designation</Label>
                          <Input
                            value={guest.designation}
                            onChange={(e) => handleGuestChange(index, "designation", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Department</Label>
                          <Input
                            value={guest.department}
                            onChange={(e) => handleGuestChange(index, "department", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Always show Add Guest button */}
                <div className="flex justify-between gap-4 mb-4">
                  <Button onClick={handleAddGuest}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Guest
                  </Button>

                  {guests.length > 0 && (
                    <Button variant="destructive" onClick={handleRemoveAllGuests}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete All
                    </Button>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={handleUpdateWelcome}
                  className="w-full md:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>Manage News Ticker</CardTitle>
                <CardDescription>Add or remove news scrolling at bottom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Add New News Item</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter news title"
                        value={newNewsTitle}
                        onChange={(e) => setNewNewsTitle(e.target.value)}
                      />
                      <Button onClick={handleAddNews} disabled={isNewsLoading}>
                        {isNewsLoading ? "Adding..." : <><PlusCircle className="mr-2 h-4 w-4" /> Add Item</>}
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-4">Current News Items</h3>
                    {newsItems.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>No news items yet.</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {newsItems.map((news) => (
                          <div key={news.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-md border">
                            <p className="font-medium">{news.title}</p>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteNews(news.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <VideoManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
