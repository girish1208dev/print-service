import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface UserInfo {
  name: string;
  phone: string;
  location: string;
}

export default function UserInfoForm({
  onUserInfoChange,
}: {
  onUserInfoChange?: (info: UserInfo) => void;
}) {
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const savedInfo = localStorage.getItem("photoOrderUserInfo");
    return savedInfo
      ? JSON.parse(savedInfo)
      : { name: "", phone: "", location: "" };
  });

  useEffect(() => {
    localStorage.setItem("photoOrderUserInfo", JSON.stringify(userInfo));
    if (onUserInfoChange) onUserInfoChange(userInfo);
  }, [userInfo, onUserInfoChange]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Your Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={userInfo.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={userInfo.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Delivery Location</Label>
          <Textarea
            id="location"
            name="location"
            value={userInfo.location}
            onChange={handleChange}
            placeholder="Enter your delivery address"
            required
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}
