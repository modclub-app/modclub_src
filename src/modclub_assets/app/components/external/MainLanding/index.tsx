import React from 'react';
import '../landing/Landing.scss';

// Components
import { PageMainStyles } from './PageMainStyles';
import { IntroductorySection } from './IntroductorySection'
import { TopBar } from './TopBar';
import { ProjectsSection } from './ProjectsSection';
import { Footer } from './Footer';
import { ScrollContainer } from './ScrollContainer';

const MainLanding = () => (
  <ScrollContainer>
    <PageMainStyles />
    <TopBar />
    <IntroductorySection />
    <ProjectsSection />
    <Footer />
  </ScrollContainer>
);

export default MainLanding;