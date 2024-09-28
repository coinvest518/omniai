import React from 'react';
import './GlassmorphismCard.css';
import 'font-awesome/css/font-awesome.min.css';
import { Prompt } from '../../data/promptsData';
import Image from 'next/image';
import Link from 'next/link';

interface GlassmorphismCardProps {
  imgSrc: string;
  promptTitle: string;
  prompts: Prompt[];
  description: string;
  onClick: () => void;
  isPurchased?: boolean;
  onCopyClick?: () => void;
  showCopyButton?: boolean;
}


const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({ imgSrc, promptTitle, description, onClick}) => {
    
  
  return (
      <div className="card" onClick={onClick}>
        <div className="imgBx">
          <Image src={imgSrc} alt="Card Image" width={1024} height={1024}/>
        </div>
        <div className="content">
          <div className="contentBx">
            <h3>{promptTitle}</h3>
            <p>{description}</p>
            
          </div>
          <ul className="sci">
            <li>
              <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); }}>
                <i className="fab fa-facebook"></i>
              </Link>
            </li>
            <li>
              <Link href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); }}>
                <i className="fab fa-twitter"></i>
              </Link>
            </li>
            <li>
              <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); }}>
                <i className="fab fa-instagram"></i>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  };
  
  export default GlassmorphismCard;