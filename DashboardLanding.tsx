/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';
import { useEffect, useState } from 'react'; //B/E

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import DailyQuote from '../DailyQuote/DailyQuote';

import { IconButton, Badge } from '@mui/material';
import { NotificationsRounded } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { FaMagnifyingGlass } from 'react-icons/fa6';

import styles from '../../routes/Dashboard/Dashboard.module.css';

import SessionTable from '../SessionsTable/SessionsTable';

import notificationsData from '../Notifications/DummyNotifications.json';

import { Gauge } from '@mui/x-charts-pro';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';

import ProfileAvatar from '../ProfileAvatar/ProfileAvatar';
import LastSynced from '../LastSynced/LastSynced';

const heartRateData = [
	{ time: 1, heartRate: 60 },
	{ time: 2, heartRate: 65 },
	{ time: 3, heartRate: 70 },
	{ time: 4, heartRate: 75 },
	{ time: 5, heartRate: 80 },
	{ time: 6, heartRate: 85 },
];

// Assuming you calculate unreadCount from notificationsData or elsewhere
const unreadCount = notificationsData.filter(n => !n.read).length;

//B/E fetch user data from the dashboard endpoint.
const DashboardLanding: React.FC = () => {
	const [userData, setUserData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);


	
	const [vo2Max, setVo2Max] = useState<number | null>(null);

	// Fetch user data on component mount
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await fetch('http://localhost:5000/api/dashboard');
				const text = await response.text();
				console.log(text);  // Check the response content

				if (response.ok) {
					const data = JSON.parse(text);  // Only parse if it's valid JSON
					setUserData(data);  // Set the data in state
				} else {
					console.error('Failed to fetch user data');
				}
			} catch (error) {
				console.error('Error fetching user data', error);
			} finally {
				setIsLoading(false);  // Set loading state to false once done
			}
		};

		fetchUserData();
	}, []);

	// Effect to fetch VO2 max from body_insight API
	useEffect(() => {
		const fetchVO2Max = async () => {
			try {
				// Gets latest VO2 max value from body_insight based on latest activity recorded.
				const response = await fetch('http://localhost:5000/api/body_insight/latest');

				if (response.ok) {
					const data = await response.json();
					setVo2Max(data.vo2_max ?? 0);
				} else {
					console.error('Failed to fetch VO2 max');
				}
			} catch (error) {
				console.error('Error fetching VO2 max:', error);
			}
		};
		fetchVO2Max();
	}, []);

	return (
		<main className={styles.mainContainerLanding}>
			{/* Header Bar */}
			<div className={styles.topBar}>
				<div>
					<h1 className={styles.dashboardTitle}>
						Welcome {userData ? userData.name : 'Loading...'}!
					</h1>
					<LastSynced />
					<DailyQuote />
				</div>

				<div className={styles.searchAndIcons}>
					<div className={styles.searchContainer}>
						<FaMagnifyingGlass className={styles.searchIcon} />
						<input type="search" className={styles.searchInput} placeholder="Search" />
					</div>

					<Link to="/notifications" className={styles.link}>
						<IconButton>
							<Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
								<NotificationsRounded sx={{ fontSize: 36 }} />
							</Badge>
						</IconButton>
					</Link>

					{/* Show avatar from backend */}
					<ProfileAvatar avatarUrl={userData?.avatar} />
				</div>
			</div>

			{/* Heart Rate Section */}
			<div className={styles.heartRateCalSection}>
				<div className={styles.heartRateWindow}>
					<h3 className={styles.componentText}>Heart Rate</h3>
					<div
						style={{ position: 'relative', width: '100%', height: '300px' }}
						onClick={(event) => {
							const container = event.currentTarget;
							const rect = container.getBoundingClientRect();
							const x = event.clientX - rect.left;
							const clickedIndex = Math.floor((x / rect.width) * heartRateData.length);
							if (clickedIndex >= 0 && clickedIndex < heartRateData.length) {
								const pointData = heartRateData[clickedIndex];
								alert(`Time(s) ${pointData.time}: ${pointData.heartRate} bpm`);
							}
						}}
					>
						<LineChart
							xAxis={[{ data: heartRateData.map(e => e.time), label: 'Time (s)' }]}
							series={[{ data: heartRateData.map(e => e.heartRate), label: 'Heart Rate (bpm)' }]}
						/>
					</div>
				</div>

				{/* Sessions and Calendar */}
				<div className={styles.sideBySideComponents}>
					<div className={styles.SessionsProfileWindow}>
						<h1>Your Sessions</h1>
						<SessionTable onRowClick={() => { }} />
					</div>

					<div className={styles.calV02Box}>
						<div className={styles.calendarWindow}>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DateCalendar />
							</LocalizationProvider>
						</div>

						<div className={styles.VO2Window}>
							<h3 className={styles.componentTextVO2}>VO2 Max</h3>
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 3 }}>
								<Gauge width={200} height={200} value={vo2Max} />
							</Stack>
						</div>
					</div>
				</div>

				{/* Performance Tips */}
				<div className={styles.PerformanceTipsWindow}>
					<h1>Performance Tips</h1>
					<ul>
						<li>
							<h3>Hydrate</h3>
							<p>Staying hydrated is essential for mental and physical performance.</p>
							<p><strong>Tip:</strong> Aim to drink water regularly throughout the day.</p>
						</li>
						<li>
							<h3>Be Consistent</h3>
							<p>Consistency is key to long-term performance.</p>
							<p><strong>Tip:</strong> Create habits you can stick to daily.</p>
						</li>
						<li>
							<h3>Set Goals</h3>
							<p>Clear goals give direction and motivation.</p>
							<p><strong>Tip:</strong> Break larger goals into smaller tasks.</p>
						</li>
						<li>
							<h3>Have a Motive</h3>
							<p>Understanding your "why" enhances commitment.</p>
							<p><strong>Tip:</strong> Write down personal motivations for reference.</p>
						</li>
						<li>
							<h3>Prioritize Sleep</h3>
							<p>Sleep is essential for cognitive function and productivity.</p>
							<p><strong>Tip:</strong> Aim for 7–9 hours of sleep and a good bedtime routine.</p>
						</li>
					</ul>
				</div>
			</div>
		</main>
	);
};

export default DashboardLanding;
