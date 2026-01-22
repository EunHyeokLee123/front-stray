
import { useState } from "react";

export const useUserPageData = () => {
  const [formData, setFormData] = useState({
    name: "홍길동",
    email: "user@example.com",
    phone: "010-1234-5678",
    password: "",
    confirmPassword: "",
    joinDate: "2024-01-15",
    profileImage: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
  });

  const myPosts = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: `내가 작성한 게시글 ${i + 1}`,
    category: ["자유게시판", "질문게시판", "후기게시판"][i % 3],
    date: `2024-06-${String(20 - (i % 20)).padStart(2, '0')}`,
    views: Math.floor(Math.random() * 100) + 10,
    likes: Math.floor(Math.random() * 20),
    comments: Math.floor(Math.random() * 15),
  }));

  const myComments = Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    postTitle: `댓글을 단 게시글 ${i + 1}`,
    comment: `이것은 제가 작성한 댓글입니다. ${i + 1}번째 댓글입니다.`,
    date: `2024-06-${String(25 - (i % 25)).padStart(2, '0')}`,
  }));

  const likedPosts = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    title: `좋아요한 게시글 ${i + 1}`,
    author: `작성자${i + 1}`,
    date: `2024-06-${String(15 - (i % 15)).padStart(2, '0')}`,
    likes: Math.floor(Math.random() * 50) + 5,
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    console.log("수정된 정보:", formData);
    alert("정보가 수정되었습니다.");
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));
    }
  };

  return {
    formData,
    myPosts,
    myComments,
    likedPosts,
    handleInputChange,
    handleSubmit,
    handleProfileImageChange,
  };
};
