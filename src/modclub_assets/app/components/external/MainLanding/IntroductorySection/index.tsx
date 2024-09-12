import React from 'react';
import classNames from 'classnames/bind';
import { useHistory } from "react-router-dom";

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { AnimLayout } from "./AnimLayout";
import { Title } from './Title';
import { SubTitle } from './SubTitle';
import { MainButton } from './MainButton';

export const IntroductorySection = () => {
  const history = useHistory();
  return (
    <section className={cn("introductory")}>
      <AnimLayout>
        <div className={cn("introductory-container")}>
          <div className={cn("introductory-content")}>
            <Title />
            <SubTitle />
          </div>

          <MainButton 
            onClick={() => history.push("/app")}
            buttonText="Start your journey"
          />
        </div>
      </AnimLayout>
    </section>
  );
}