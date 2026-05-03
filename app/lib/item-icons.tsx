import {
  // Life Infrastructure
  House, Baby, Key, Bed, ForkKnife, Broom, PawPrint, HandHeart, Phone, HandshakeSimple, Briefcase,
  // Relational Commitment
  LockSimple, Star, ShieldCheck, Flag, SunHorizon, CalendarCheck, MapTrifold, Tag, Mountains,
  FirstAidKit, Heart,
  // Quality Time
  Palette, Sparkle, Coffee, Moon, Confetti, Airplane, PaintBrush, Wrench, Wine, Couch,
  // Emotional Intimacy
  HeartStraight, ChatText, MagnifyingGlass, CloudMoon, Drop, Brain, Heartbeat, Anchor, Lock,
  ChatCenteredDots, Handshake, UsersThree, LinkSimple,
  // Physical Intimacy
  PersonSimple, PersonArmsSpread, Hand, Leaf, Flame, Sparkles, Globe, Link,
  // Social Integration
  Users, UserPlus, Tree, UserCheck, ShareNetwork, Ticket, UsersFour,
  // Financial/Legal
  Gift, Receipt, CurrencyDollar, TrendUp, Bank, Scales, Ring, HandCoins, PiggyBank,
  // Communication
  Microphone, VideoCamera, Newspaper, Smiley, BookOpen, ClipboardText, Eye, Eyeglasses,
  // Time and Rhythms
  Clock, Calendar, Lightning, MapPin, Shuffle, Repeat, CalendarBlank, CalendarDots,
  CalendarPlus, SquaresFour, Comet,
  // Tones
  Dog, ArrowsSplit,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

export const ITEM_ICONS: Record<string, Icon> = {
  // ---- Life Infrastructure ----
  'Co-Housing':                   House,
  'Co-Parenting':                 Baby,
  'Home Ownership':               Key,
  'Shared Sleeping Space':        Bed,
  'Shared Meals':                 ForkKnife,
  'Shared Chores':                Broom,
  'Shared Pets/Plants':           PawPrint,
  'Shared External Caretaking':   HandHeart,
  'Emergency Contact':            Phone,
  'Mutual Aid':                   HandshakeSimple,
  'Business Collaborations':      Briefcase,

  // ---- Relational Commitment ----
  'Exclusivity':                  LockSimple,
  'Prioritization':               Star,
  'Reliability':                  ShieldCheck,
  'Allyship':                     Flag,
  'Focusing on the "Here and Now"': SunHorizon,
  'Long-Term Involvement':        CalendarCheck,
  'Future Plans Together':        MapTrifold,
  'Relationship Labels':          Tag,
  'Working Through Challenges':   Mountains,
  'Support Through Health Challenges': FirstAidKit,
  'End of Life Care':             Heart,

  // ---- Quality Time ----
  'Shared Hobbies or Activities': Palette,
  'Activities That Are "Yours"':  Sparkle,
  'Shared Rituals':               Coffee,
  'Date Nights':                  Wine,
  'Spending the Night':           Moon,
  'Parallel Play':                Couch,
  'Celebrating Events or Holidays': Confetti,
  'Trips Together':               Airplane,
  'Creative Collaboration':       PaintBrush,
  'Project Collaboration':        Wrench,

  // ---- Emotional Intimacy ----
  'Terms of Endearment':          HeartStraight,
  'Words of Affirmation':         ChatText,
  'Saying "I Love You"':          Heart,
  'Knowing Personal Likes and Dislikes': MagnifyingGlass,
  'Sharing Longings':             CloudMoon,
  'Sharing Vulnerable Feelings':  Drop,
  'Sharing About Mental Health':  Brain,
  'Supporting Mental Health Work': Heartbeat,
  'Offering Emotional Support':   HandHeart,
  'Being Relied Upon for Support': Anchor,
  'Being a Confidante':           Lock,
  'Expressing Disagreements or Hurt Feelings': ChatCenteredDots,
  'Addressing and Resolving Conflict': Handshake,
  '3rd Party Support':            UsersThree,
  'Multiple Emotional Bonds':     LinkSimple,

  // ---- Physical Intimacy ----
  'Body Contact':                 PersonSimple,
  'Physical Affection':           HeartStraight,
  'Hugs':                         PersonArmsSpread,
  'Hand Holding':                 Handshake,
  'Kissing':                      Heart,
  'Cuddling':                     Moon,
  'Massage':                      Hand,
  'Co-Sleeping':                  Bed,
  'Nudity':                       Leaf,
  'Sensual Interactions':         Flame,
  'Sexual Interactions':          Sparkles,
  'Public Displays of Affection': Globe,
  'Kink':                         Link,
  'Multiple Sexual Connections':  ArrowsSplit,

  // ---- Social Integration ----
  'Down to Meet Friends':         Users,
  'Down to Meet Metamours':       UserPlus,
  'Down to Meet Family':          House,
  'Integrate with Friends':       UsersThree,
  'Integrate with Metamours':     UserCheck,
  'Integration with Family':      Tree,
  'Supporting Friendships':       UsersFour,
  'Supporting Metamour Relationships': HeartStraight,
  'Presenting as a Social Unit in Public': Globe,
  'Presenting as a Social Unit on Social Media': ShareNetwork,
  'Serving as +1 for Social Events': Ticket,
  'Joint Trips with Family/Friends': Airplane,

  // ---- Financial/Legal ----
  'Gifts':                        Gift,
  'Sharing Costs':                Receipt,
  'Lending Money':                HandCoins,
  'Financial Support':            CurrencyDollar,
  'Financial Integration':        TrendUp,
  'Shared Bank Account(s)':       PiggyBank,
  'Legal Processes':              Scales,
  'Marriage/Civil Partnership':   Ring,

  // ---- Communication ----
  'Texting':                      ChatText,
  'Voice Messages':               Microphone,
  'Phone/Video Calls':            VideoCamera,
  'Discussing Work and Hobbies':  Briefcase,
  'Discussing Politics and Current Events': Newspaper,
  'Intellectual/Philosophical Discussions': Brain,
  'Discussing Family, Partners, Relationships': UsersThree,
  'Playing and Laughing Together': Smiley,
  'Sharing Stories About the Past': BookOpen,
  'Relationship "Check-Ins"':     ClipboardText,
  'Radical Honesty':              Eye,
  'Transparency Across Relationships': Eyeglasses,

  // ---- Time and Rhythms ----
  'Expectations Around Responding to Messages': Clock,
  'Daily or Frequent Communication': CalendarCheck,
  'Unplanned Communication':      Lightning,
  'Integrated into Daily Life':   SquaresFour,
  'Long Distance':                MapPin,
  'Spontaneous Hangouts':         Shuffle,
  'Planned Hangouts':             Calendar,
  'Regularly Scheduled Time Together': Repeat,
  'Weekly Hangouts':              CalendarBlank,
  'Monthly Hangouts':             CalendarDots,
  'Yearly Hangouts':              CalendarPlus,
  'Seasonal/Contextual Connecting': Comet,

  // ---- Tones ----
  'Companionship':                Dog,
  'Friendship':                   Users,
  'Chosen Family':                Tree,
  'Therapeutic':                  Heartbeat,
  'Romantic':                     Heart,
  'Erotic':                       Flame,
  'Comet/Seasonal':               Comet,
};

export function getItemIcon(item: string): Icon {
  return ITEM_ICONS[item] ?? Sparkle;
}
