import React from 'react';

import Hero from '../components/Hero';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Home() {
	return (
		<section id="home">
			<Nav loggedIn={false} />
			<Hero />
			<Footer />
		</section>
	);
}
