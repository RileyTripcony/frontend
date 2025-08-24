import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileAvatar.css';
import ProfilePic from '../../assets/ProfilePic.png';

const ProfileAvatar: React.FC = () => {
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(true); // Login state
	const [avatar, setAvatar] = useState<string>(ProfilePic); // B/E avatar state
	const navigate = useNavigate();
	const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// B/E Fetch user profile (including avatar) from API
	useEffect(() => {
		fetch('http://localhost:5000/api/profile')
			.then(res => res.json())
			.then(data => {
				if (data.avatar) {
					setAvatar(data.avatar); // Set the avatar from API response
				}
			})
			.catch(err => {
				console.error('Error fetching profile:', err);
			});
	}, []);
	////////////////////////////////////////////////////////////////////////////////

	const handleMouseEnter = () => {
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current);
		}
		setIsPopupVisible(true);
	};

	const handleMouseLeave = () => {
		hideTimeoutRef.current = setTimeout(() => {
			setIsPopupVisible(false);
		}, 1000); // Delay before hiding
	};

	const handleLogout = () => {
		localStorage.removeItem('authToken'); // Clear token
		setIsLoggedIn(false); // Update state
	};

	const handleChangeAccount = () => {
		handleLogout();
		navigate('/login');
	};

	return (
		<div
			className="profile-container"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{/* User avatar */}
			<img src={avatar} alt="User Avatar" className="profile-avatar" /> {/* B/E: use fetched avatar */}

			{/* Popup menu */}
			{isPopupVisible && (
				<div
					className="profile-popup"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					{isLoggedIn ? (
						<>
							<p> Username</p>
							<button
								className="profile-button"
								onClick={() => navigate('/dashboard/settings')}
							>
								Settings
							</button>
							<button
								className="profile-button"
								onClick={() => navigate('/profile')}
							>
								Profile
							</button>
							<button className="profile-button" onClick={handleChangeAccount}>
								Change Account
							</button>
							<button className="profile-button" onClick={handleLogout}>
								Logout
							</button>
						</>
					) : (
						<>
							<p> Please Login</p>
							<button
								className="profile-button"
								onClick={() => navigate('/login')}
							>
								Login
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default ProfileAvatar;
