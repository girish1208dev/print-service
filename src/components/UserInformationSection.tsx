import React, { useState, useEffect } from "react";
import UserInfoForm from "./UserInfoForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Edit, Check } from "lucide-react";

interface UserInfo {
  name: string;
  phone: string;
  location: string;
}

interface UserInformationSectionProps {
  onUserInfoChange?: (info: UserInfo) => void;
  className?: string;
}

export default function UserInformationSection({
  onUserInfoChange = () => {},
  className = "",
}: UserInformationSectionProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const savedInfo = localStorage.getItem("photoOrderUserInfo");
    return savedInfo
      ? JSON.parse(savedInfo)
      : { name: "", phone: "", location: "" };
  });

  useEffect(() => {
    // Check if we have complete user info to determine edit state
    if (userInfo.name && userInfo.phone && userInfo.location) {
      setIsEditing(false);
    }
  }, []);

  const handleUserInfoChange = (info: UserInfo) => {
    setUserInfo(info);
    onUserInfoChange(info);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const isInfoComplete = userInfo.name && userInfo.phone && userInfo.location;

  return (
    <Card className={`w-full bg-white ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">
            Delivery Information
          </CardTitle>
          <CardDescription>
            Please provide your contact and delivery details
          </CardDescription>
        </div>
        {isInfoComplete && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditToggle}
            className="flex items-center gap-1"
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4" /> Done
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" /> Edit
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <UserInfoForm onUserInfoChange={handleUserInfoChange} />
        ) : (
          <div className="space-y-4 p-4 border rounded-md bg-slate-50">
            <div>
              <h3 className="font-medium text-sm text-slate-500">Name</h3>
              <p className="text-lg">{userInfo.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-slate-500">Phone</h3>
              <p className="text-lg">{userInfo.phone}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-slate-500">
                Delivery Location
              </h3>
              <p className="text-lg whitespace-pre-line">{userInfo.location}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
