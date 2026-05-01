import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/spinner";
import authService from "../../Services/authService";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Brain,
  Globe,
  Calendar
} from "lucide-react";
import SaveButton from "../../components/common/saveButton";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [passwordloading, setPasswordLoading] = useState(false);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    dob: "",
    gender: "",
    university: "",
    school: "",
    major: "",
    learningTime: "",
    timezone: "",
    language: "",
    linkedin: "",
    github: "",
    portfolio: ""
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // const fetchProfile = async () => {
  //   try {
  //     const { data } = await authService.getProfile();
  //     setProfile(prev => ({ ...prev, ...data }));
  //   } catch (error) {
  //     toast.error("Failed to fetch profile data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const fetchProfile = async () => {
  try {
    const res = await authService.getProfile();
    // console.log(res);

    setProfile(prev => ({
      ...prev,
      ...res.data
    }));

  } catch (error) {
    toast.error("Failed to fetch profile");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

//   const handleSaveProfile = async () => {
//   try {
//     await authService.updateProfile(profile);
//     await fetchProfile();

//   } catch {
//     toast.error("Failed to update profile");
//   }
// };
const handleSaveProfile = async () => {
  try {

    const res = await authService.updateProfile(profile);
    // const res = await updateProfile(profile);

    // instant UI update
    setProfile(prev => ({
      ...prev,
      ...res.data || res
    }));

    toast.success("Profile saved");

  } catch (error) {
    toast.error("Failed to update profile");
  }
};

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      await authService.changePassword({ currentPassword, newPassword });
      // toast.success("Password changed successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error(error.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
    )
  }

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* USER INFO */}
        <Card
          icon={<User className="w-6 h-6 text-[#00d492]" />}
          color="bg-[#00d492]/10"
          title="User Information"
          subtitle="Your basic account details"
        >
          <DisplayField label="Username" value={profile.username} icon={<User size={16} />} />
          <DisplayField label="Email Address" value={profile.email} icon={<Mail size={16} />} />
        </Card>


{/* CHANGE PASSWORD */}
        <Card
          icon={<Lock className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
          title="Change Password"
          subtitle="Update your account password"
        >
          <form onSubmit={handleChangePassword} className="space-y-4">

            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={passwordloading}>
                {passwordloading ? "Changing..." : "Change Password"}
              </Button>
            </div>

          </form>
        </Card>
        
        {/* PERSONAL INFO */}
        <Card
          icon={<Phone className="w-6 h-6 text-indigo-600" />}
          color="bg-indigo-50"
          title="Personal Information"
          subtitle="Your personal details"
        >
          <Input label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} />
          <Input label="Middle Name" name="middleName" value={profile.middleName} onChange={handleChange} />
          <Input label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} />
          <Input label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} />
          <Input label="Date of Birth" type="date" name="dob" value={profile.dob ? profile.dob.split("T")[0] : ""} onChange={handleChange} />
        </Card>


        {/* ACADEMIC INFO */}
        <Card
          icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50"
          title="Academic Information"
          subtitle="Your education details"
        >
          <Input label="University" name="university" value={profile.university} onChange={handleChange} />
          <Input label="School" name="school" value={profile.school} onChange={handleChange} />
          <Input label="Major / Subject" name="major" value={profile.major} onChange={handleChange} />
        </Card>


        {/* LEARNING PREFERENCES */}
        <Card
          icon={<Brain className="w-6 h-6 text-amber-600" />}
          color="bg-amber-100"
          title="Learning Preferences"
          subtitle="Customize your study experience"
        >
          <Input label="Preferred Study Time" name="learningTime" value={profile.learningTime} onChange={handleChange} />
          <Input label="Timezone" name="timezone" value={profile.timezone} onChange={handleChange} />
          <Input label="Language" name="language" value={profile.language} onChange={handleChange} />
        </Card>

                
        {/* SOCIAL LINKS */}
        <Card
          icon={<Globe className="w-6 h-6 text-pink-600" />}
          color="bg-pink-100"
          title="Social Links"
          subtitle="Your professional profiles"
        >
          <Input label="LinkedIn URL" name="linkedin" value={profile.linkedin} onChange={handleChange} />
          <Input label="GitHub URL" name="github" value={profile.github} onChange={handleChange} />
          <Input label="Portfolio Website" name="portfolio" value={profile.portfolio} onChange={handleChange} />
        </Card>

      </div>

      <div className="flex justify-center">
        {/* <Button onClick={handleSaveProfile}>Save Profile</Button> */}
        <SaveButton onClick={handleSaveProfile}/>
      </div>

    </div>
  );
};


/* ---------- CARD COMPONENT ---------- */

const Card = ({ icon, color, title, subtitle, children }) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-7 shadow-sm">

    <div className="flex items-center gap-4 mb-6">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
    </div>

    <div className="space-y-4">
      {children}
    </div>

  </div>
);


/* ---------- INPUT COMPONENT ---------- */

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-xs font-medium text-neutral-600 mb-1 block">
      {label}
    </label>

    <input
      {...props}
      className="w-full h-10 px-3 border border-neutral-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
    />
  </div>
);


/* ---------- DISPLAY FIELD ---------- */

const DisplayField = ({ label, value, icon }) => (
  <div>
    <label className="text-xs font-medium text-neutral-600 mb-1 block">
      {label}
    </label>

    <div className="flex items-center h-10 px-3 border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900">
      <span className="text-neutral-400 mr-2">{icon}</span>
      {value}
    </div>
  </div>
);

export default ProfilePage;