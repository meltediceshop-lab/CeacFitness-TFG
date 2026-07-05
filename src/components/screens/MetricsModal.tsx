'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart } from '@/components/metrics/LineChart';
import type { BodyMeasurementRecord } from '@/types/user';

// ─── Paths del proyecto react-native-body-highlighter (MIT) ───────────────────
// Male viewBox "0 0 724 1448"
const MALE_BODY = 'M 309.48 168.91 Q 305.84 164.32 303.32 169.76 C 298.49 180.21 308.31 200.03 314.51 208.74 C 316.34 211.31 318.01 208.95 318.58 207.26 A 0.67 0.66 57.6 0 1 319.87 207.55 C 319.06 215.09 318.68 227.40 324.34 232.47 C 327.22 235.05 326.97 235.88 326.92 239.51 Q 326.68 255.16 323.97 266.82 Q 323.85 267.35 323.48 267.73 Q 308.61 282.73 290.26 293.23 C 278.34 300.05 267.53 299.26 253.00 298.03 Q 237.49 296.72 224.74 305.21 C 208.71 315.86 190.95 335.73 189.24 355.50 Q 186.95 381.81 190.53 412.66 C 190.79 414.92 190.69 417.49 191.02 419.92 Q 191.09 420.43 190.88 420.90 C 187.89 427.65 183.99 434.89 181.93 441.29 C 177.25 455.76 176.31 470.23 176.20 486.02 Q 176.20 486.51 175.90 486.90 C 159.84 507.69 147.56 529.29 141.49 554.95 Q 140.10 560.80 138.16 574.66 Q 131.28 623.74 118.11 671.52 C 115.99 679.21 112.98 690.29 104.08 693.63 Q 90.70 698.65 79.29 707.27 C 73.17 711.89 69.48 719.95 66.12 726.62 C 62.44 733.91 47.57 737.30 49.20 746.00 C 49.75 748.96 51.89 750.13 54.75 750.02 Q 67.27 749.50 74.18 740.00 C 76.03 737.45 77.93 736.62 80.54 735.24 Q 81.02 734.98 81.24 735.48 Q 84.59 743.00 80.47 750.73 Q 71.41 767.75 62.21 784.70 Q 60.53 787.81 59.49 791.20 C 57.52 797.69 65.78 800.84 69.45 795.20 C 76.80 783.92 82.72 773.30 92.55 762.52 Q 93.00 762.04 92.84 762.67 Q 87.89 783.24 79.07 802.44 C 77.36 806.17 75.64 812.30 79.19 815.18 C 89.50 823.53 107.08 773.44 109.24 767.88 A 0.37 0.36 -30.3 0 1 109.94 768.06 C 108.51 777.44 106.43 787.14 105.28 796.13 C 104.34 803.43 103.67 808.49 104.41 814.32 C 105.40 822.00 112.74 817.15 114.09 812.77 C 118.56 798.32 120.41 781.74 125.18 766.21 A 0.55 0.55 0.0 0 1 125.93 765.87 C 131.64 768.40 126.65 796.54 133.38 803.49 A 1.35 1.35 0.0 0 0 134.16 803.90 C 138.40 804.59 139.71 797.34 140.15 793.73 Q 141.74 780.80 142.58 767.76 Q 142.86 763.46 144.07 759.34 Q 150.39 737.64 154.77 715.46 Q 156.15 708.50 155.48 697.76 Q 154.48 681.63 161.99 665.46 Q 180.58 625.46 201.25 586.52 C 213.64 563.18 218.66 541.14 220.65 514.18 C 221.24 506.18 223.22 502.59 228.42 495.84 C 237.76 483.72 242.73 464.92 246.12 450.19 Q 246.24 449.64 246.75 449.42 L 250.30 447.82 A 0.49 0.49 0.0 0 1 250.99 448.23 Q 252.78 470.14 257.44 487.01 C 259.04 492.80 264.20 498.21 265.32 505.20 C 265.91 508.82 266.99 512.44 267.11 516.00 Q 267.57 529.33 266.95 540.50 C 265.58 565.32 263.85 592.20 259.98 619.13 C 258.39 630.19 253.14 640.55 250.52 651.43 Q 245.19 673.62 242.32 696.24 C 239.63 717.56 236.59 740.02 236.04 757.75 Q 234.98 791.48 237.98 842.55 Q 239.43 867.18 244.64 891.26 Q 247.76 905.70 255.88 917.90 Q 256.15 918.31 256.08 918.79 C 254.89 926.25 257.03 933.47 255.60 940.95 Q 252.28 958.32 251.77 975.98 C 251.55 983.43 252.85 991.28 253.67 998.93 Q 253.99 1001.95 253.29 1005.00 C 239.19 1067.03 246.93 1130.64 261.77 1190.07 C 266.01 1207.06 266.47 1222.37 264.71 1240.03 C 263.85 1248.62 262.10 1260.41 264.24 1268.75 C 266.05 1275.80 267.54 1287.46 261.78 1293.28 C 256.71 1298.39 242.40 1310.55 240.72 1316.98 C 239.19 1322.86 235.04 1332.26 242.29 1333.71 Q 244.23 1333.29 245.05 1333.02 Q 244.81 1333.85 242.95 1340.16 C 249.20 1340.52 253.77 1340.86 256.46 1341.06 C 257.37 1343.60 259.30 1344.71 263.13 1346.91 Q 267.14 1344.43 267.92 1344.56 Q 271.17 1348.61 276.21 1349.09 C 278.90 1349.35 281.27 1347.36 283.62 1346.09 Q 284.44 1346.26 288.33 1351.29 Q 294.72 1351.38 298.54 1350.79 Q 301.20 1348.30 306.57 1341.58 C 312.04 1334.74 311.14 1328.85 310.29 1320.16 C 309.43 1311.33 311.17 1303.41 313.76 1295.20 C 315.84 1288.56 313.35 1280.06 314.07 1273.15 C 314.57 1268.39 315.80 1263.68 315.01 1259.02 C 314.06 1253.42 311.98 1247.60 311.31 1242.66 Q 309.57 1229.80 309.57 1219.75 Q 309.57 1192.29 313.54 1161.94 C 315.34 1148.21 319.24 1136.08 324.12 1123.46 Q 326.10 1115.72 330.14 1081.34 C 326.20 1048.44 320.65 1013.26 319.84 1008.17 C 319.39 1002.54 321.72 997.72 328.03 984.68 C 329.28 969.38 329.07 954.15 327.95 944.55 C 327.13 933.64 329.28 925.78 330.82 919.80 C 334.72 904.69 337.76 888.96 341.43 874.30 Q 348.95 844.25 355.42 813.95 C 358.50 799.49 357.75 768.06 356.77 748.50 L 363.71 751.99 A 1.07 1.07 0.0 0 0 364.67 751.99 L 371.98 748.89 C 369.47 765.94 370.28 783.04 371.30 800.17 Q 372.73 813.51 378.37 839.12 C 384.90 864.49 390.59 890.08 394.83 909.20 Q 399.51 928.22 400.58 941.57 C 398.11 958.92 398.53 982.22 407.11 998.54 C 408.74 1005.35 408.31 1008.09 402.82 1043.75 C 398.07 1079.22 402.19 1115.33 404.21 1123.44 C 410.53 1140.06 413.55 1150.61 415.25 1164.75 C 418.31 1190.26 420.52 1218.43 416.79 1244.33 C 415.56 1252.86 411.78 1258.57 413.63 1267.80 Q 415.33 1276.21 414.16 1284.74 C 413.11 1292.39 415.65 1298.68 417.31 1305.89 C 419.02 1313.32 418.11 1320.99 417.47 1328.50 C 416.71 1337.55 423.74 1344.86 430.17 1350.90 A 1.48 1.46 -18.7 0 0 430.95 1351.28 Q 439.25 1352.41 444.03 1346.06 Q 444.87 1345.96 453.39 1352.89 Q 460.81 1344.11 461.23 1344.37 C 469.09 1349.37 469.89 1340.80 474.98 1340.71 C 479.52 1340.64 485.21 1340.09 483.54 1333.77 Q 483.97 1333.35 488.25 1334.67 C 490.66 1331.94 490.06 1327.75 489.09 1321.04 C 487.50 1314.41 483.44 1310.30 474.77 1301.53 Q 466.05 1292.83 463.74 1270.47 C 466.27 1260.35 464.49 1248.06 463.03 1236.25 C 461.04 1220.05 463.22 1204.28 467.41 1187.04 C 481.60 1128.60 488.89 1065.20 475.23 1006.07 C 473.92 1000.37 475.00 995.00 475.76 989.36 C 477.88 973.68 475.72 958.50 473.08 942.76 C 471.70 934.55 473.60 926.56 472.20 918.79 Q 472.39 917.89 483.07 902.63 C 486.53 880.99 488.49 863.25 492.12 830.38 C 492.47 797.34 492.26 764.31 492.11 741.56 C 488.80 719.07 486.12 696.53 484.30 681.19 C 480.76 664.32 477.47 649.99 474.89 638.73 C 469.69 628.87 468.04 617.25 465.37 598.45 C 464.19 580.92 462.40 556.31 461.01 522.74 Q 461.13 512.05 463.22 504.00 C 464.54 498.90 468.30 493.91 469.91 489.46 C 474.50 476.74 476.10 461.71 477.56 448.28 Q 478.13 447.94 481.73 449.35 A 0.77 0.77 0.0 0 1 482.19 449.89 Q 486.03 466.84 492.52 482.96 C 494.16 487.04 496.63 491.75 500.12 495.79 C 505.75 502.32 507.17 507.95 508.00 517.24 C 509.72 536.47 512.15 552.06 518.89 569.24 Q 521.60 576.16 527.50 587.28 Q 543.57 617.60 558.56 648.47 C 566.04 663.89 571.90 675.54 572.85 690.59 Q 572.55 700.88 572.12 709.31 Q 573.99 718.25 577.87 736.78 Q 582.37 752.38 585.15 761.98 C 586.32 769.32 586.71 778.53 586.92 783.46 C 587.58 803.53 593.41 804.06 599.41 804.61 C 599.71 774.61 600.39 768.08 600.80 767.33 Q 601.30 766.93 603.70 767.19 C 607.27 782.50 609.43 797.55 614.25 812.25 C 615.52 816.12 618.33 820.08 622.81 817.38 Q 624.98 810.32 624.13 803.72 Q 621.83 785.89 618.23 768.64 A 0.53 0.53 0.0 0 1 619.24 768.34 C 622.72 777.06 636.06 814.20 645.24 816.03 C 650.64 817.10 652.13 811.12 650.95 807.31 C 648.59 799.74 644.42 791.59 642.09 784.69 Q 638.29 773.46 635.22 761.98 Q 640.35 767.61 644.90 773.66 C 649.45 779.70 653.60 787.18 658.03 793.93 Q 661.70 797.82 665.53 799.62 C 670.61 795.77 669.00 791.28 666.63 784.66 C 661.63 776.66 659.33 772.19 654.22 762.29 Q 648.82 752.53 646.89 735.59 Q 647.60 735.27 650.55 736.50 C 652.37 737.45 654.44 740.27 661.27 749.61 Q 673.53 749.92 680.47 740.89 C 676.20 738.28 671.33 735.31 664.61 731.14 C 661.97 725.94 657.98 718.11 654.62 711.26 Q 649.21 707.28 637.40 698.62 Q 623.76 693.40 619.45 691.75 C 615.12 686.26 613.76 682.47 608.42 667.65 Q 602.70 641.81 594.90 606.62 Q 590.85 578.90 588.46 562.58 C 587.74 559.15 582.02 531.75 569.74 509.81 C 552.98 487.61 551.81 486.06 551.97 483.26 Q 552.48 466.57 548.70 449.61 C 546.27 438.71 541.82 430.32 537.44 420.82 Q 537.28 419.85 539.40 398.94 C 540.83 377.68 539.05 356.70 537.31 336.13 C 521.34 317.28 504.86 306.23 494.75 299.45 C 485.77 296.97 473.93 298.16 464.41 299.12 Q 453.63 298.41 438.05 297.39 C 418.32 280.58 407.40 270.35 405.82 268.87 C 404.57 267.56 404.10 265.32 401.24 251.68 Q 401.26 237.76 404.68 232.04 Q 405.14 231.82 409.76 223.86 C 408.77 215.16 408.75 206.85 409.48 206.69 C 410.36 208.62 412.01 211.62 414.22 208.45 C 421.05 198.67 427.45 183.93 425.97 172.00 C 425.49 168.15 422.83 165.91 418.91 167.68';

// Female viewBox "-50 -40 734 1538"
const FEMALE_BODY = 'm 373.53,205.88 c -0.45333,0.42667 -0.81,0.91667 -1.07,1.47 -3.29333,7.06 -7.28,13.70667 -11.96,19.94 -2.14,2.84667 -4.41,5.19333 -6.81,7.04 -0.36158,0.27621 -0.53584,0.73316 -0.45,1.18 0.43333,2.3 0.96,4.58667 1.58,6.86 7,25.46 37.78,29.15 59.68,31.39 6.10667,0.62 12.19667,1.61 18.27,2.97 7.96,1.77333 14.17,3.97667 18.63,6.61 14.63,8.62 23.15,23.99 26.24,40.5 3.70667,19.74 5.03,39.49 3.97,59.25 -0.0526,0.96072 0.11501,1.92175 0.49,2.81 1.62,3.77333 3.20667,7.65 4.76,11.63 6.18,15.8 10.13333,32.57333 11.86,50.32 1.18,12.12 1.68,23.92667 1.5,35.42 -0.02,1.29333 0.40333,2.43333 1.27,3.42 17.89,20.25 33.57,44.36 41.14,69.73 2.5,8.36667 5.17333,17.90333 8.02,28.61 4.34,16.3 12.18,33.04 22.68,47.08 3.98,5.31333 7.70667,10.38667 11.18,15.22 0.59333,0.83333 1.35333,1.58333 2.28,2.25 0.28,0.2 0.59,0.3 0.93,0.3 4.22667,-0.0133 8.26333,1.50667 12.11,4.56 6.02,4.78 12.17,10.11667 18.45,16.01 1.51,1.42 3.29,2.63 5.25,3.29 9.2,3.11 19.48,8.17 17.09,19.99 -0.32,1.61 -1.49,2.31 -3.05,2.48 -4.18667,0.46 -8.50667,-0.5 -12.96,-2.88 -4.75333,-2.53333 -8.58667,-4.99667 -11.5,-7.39 -0.55333,-0.45333 -1.12667,-0.48 -1.72,-0.08 l -0.24,0.16 c -0.30375,0.208 -0.35544,0.63562 -0.11,0.91 5.52667,6.25333 9.60333,12.61667 12.23,19.09 4.1,10.08667 7.07333,20.87333 8.92,32.36 0.56667,3.52 0.71667,7.10333 0.45,10.75 -0.34667,4.75333 -3.07,6.62333 -8.17,5.61 -0.77333,-0.16 -1.02333,0.13 -0.75,0.87 0.75333,2.03333 1.44333,4.07 2.07,6.11 1.56,5.04667 -0.2,8.07 -5.28,9.07 -3.49,0.69 -5.42,-2.17 -7.04,-4.75 -1.26667,3.16 -3.75333,4.66 -7.46,4.5 -2.69,-0.11 -4.64,-2.56 -5.81,-4.72 -1.54,-2.84667 -3.06,-5.96667 -4.56,-9.36 -0.72,-1.63333 -1.17,-1.56 -1.35,0.22 -6.1,6.88 -17.12,-14.55 -18.83,-18.14 -5.52,-11.58 -10.07333,-23.92333 -13.66,-37.03 -2.86,-10.44 -5.67667,-21.13333 -8.45,-32.08 -1.38,-5.43 -3.45,-10.62 -6.82,-15.28 -15.64,-21.66 -32.51,-41.59 -48.94,-62.08 -10.83333,-13.5 -19.95333,-26.60333 -27.36,-39.31 -4.35333,-7.44667 -7.92667,-14.98 -10.72,-22.6 -2.62,-7.14 -4.03667,-14.75667 -4.25,-22.85 -0.06,-2.17 -1.76,-6 -3.08,-8.08 -1.58667,-2.49333 -2.99,-5.05667 -4.21,-7.69 -7.74667,-16.80667 -13.65,-34.53333 -17.71,-53.18 -1.79333,-8.22 -2.94,-15.92 -3.44,-23.1 -0.27333,-0.50667 -0.6,0.08 -1.26667,5.63333 -3.42667,10.71333 -6.48,15.24 -1.95,2.89 -4.68,5.3 -7.05,7.94 -1.00667,1.12667 -1.63667,2.41333 -1.89,3.86 -0.28667,1.63333 -0.46,4.66 -0.32667,32.01333 -1.04333,63.59667 -2.15,94.75 -0.1,2.86 0.11,5.76 0.63,8.7 0.94,5.33 4.48,9.32 7.59,13.42 28.13,37.13 39.68,83.8 42.02,130.13 1.55333,30.82667 0.26333,61.91 -3.87,93.25 -3.72667,28.26 -8.91333,56.45333 -15.56,84.58 -6.84667,28.98667 -14.71333,57.40667 -23.6,85.26 -1.72,5.39333 -3.00667,10.55333 -3.86,15.48 -2.69333,15.53333 -4.80333,30.7733 -6.33,45.72 -0.42667,4.1533 -0.53,11.46 0.0667,3.3133 0.56667,6.8767 1.5,10.69 5.34,21.8067 9.62333,42.4733 12.85,62 1.64667,9.9467 2.82333,20.4633 3.53,31.55 1.09333,17.08 -0.91667,33.71 -6.03,49.89 -4.02,12.69 -10.84,31.49 -15.29,47.24 -5.78,20.44 -10.58667,41.91 -14.42,64.41 -0.91333,5.3467 -1.4,15.02 -0.0267,5.0533 -0.35,15.5 -0.12,3.09 0.5,6 1.74,8.88 2.88,6.73 5.31,15.28 2.81,22.38 -2.82,8 4.32,16.54 8.4,22.9 3.28,5.1067 5.71,10.0833 7.29,14.93 1.9,5.85 8.39,13.01 13.6,16.02 5.4,3.11 7.35,6.81 7,13.31 -0.24,4.33 -3.01,4.97 -6.62,5.27 -7.24,0.5933 -14.49333,1.0133 -21.76,1.26 h -26.32 c -6.06667,-0.1867 -12.12,-0.4867 -18.16,-0.9 -3.61333,-0.2533 -6.77,-0.85 -6.82,-2.36 -6.74,-17.36 -6.44,-23.15 0.40667,-8.0133 1.49333,-15.8467 3.26,-23.5 1.32,-5.74 2.15,-11.64 2.97,-17.44 0.64,-4.61 0.02,-13.63 -0.32667,-4.6333 0.96,-13.68 0.27333,-1.26 0.4,-4.24 -0.12,-20.3133 -1.63,-61.91 -0.51333,-11.08 -2.19,-30.94 -2.64,-10.4267 -6.33,-27 -5.83,-28 -8.22,-56.65 -5.12,-86.07 0.81,-7.69 3.77,-25.59 0.82,-6.0933 2.93,-19.15 1.72667,-10.1533 3.68,-29.44 0.24667,-3.2667 -0.18,-13.73 -0.8,-12.77 -0.94,-38.64 -0.08,-4.77 -0.1,-14.08 -1.01,-6.35 -2.63,-19.09 -1.76,-17.5 -4,-43.39 -2.92,-36.9 -6.07,-104.83 -0.62,-18.13333 -0.63,-42.36 0.23,-11.76 2.96,-33.39 1.22,2.32667 2.01,4.64 2.37,6.94 0.99333,6.25333 1.84,19.13 0.87,24.2 -1.04,73.76 -1.77333,37.8 -7.99,115.58 -0.87333,9.67333 -3.48,28.38 -0.73,10.76 0.2,11.4933 -0.38,35.31 -0.37,9.95 -0.15,28.95 0.70667,7.04 2.86,21.43 1.86,11.23 4.64,30.47 1.44,9.1533 2.72,19.79 1.86,19.88 -1.38,59.81 -2,14.42 -8.5,42.6 -1.35333,5.1667 -2.71,14.35 -0.58,5.6133 -1.32,16.37 -1.40667,25.2467 -2.3,76.17 0.94,4.1867 1.1,10.49 -0.4,5.5 -0.29,14.61 0.18,3.78 3.82,22.4 2.32,10.94 2.46,30.83 -0.23,3.23 -2.37,9.18 -1.12,2.4067 -5.85,4.07 -6.41333,0.72 -19.35,1.36 h -32.5 c -19.13,-1.31 -2.99,-0.26 -6.38,-3.95 -0.89,-5.79 5.65,-14.03 3.87333,-2.1133 11.51,-10.75 1.39333,-1.8467 2.99,-5.54 2.15,-6.58 10.8,-20.3 3.01333,-3.9733 5.22,-13.46 4.1,-23.94 0.75,-1.74 0.84,-6.79 -0.22,-5.6333 -0.41,-16.98 -0.0333,-4.0267 -1.42,-13.53 -4.55,-24.93 -17.21,-73.21 -3.40667,-10.7933 -10.92,-33.2 -6.66667,-19.4867 -7.28,-59.97 1.06667,-11.9667 4.83,-35.84 3.06667,-17.02 11.15,-52.06 1.02,-4.14 1.68,-10.85 -1.76667,-16.2533 -6.8,-48.46 -0.41333,-2.42 -1.66,-6.87 -9.93333,-30.95333 -27.62,-100.13 -1.60667,-6.76 -4.35,-20.01 -3.02667,-15.4 -8.31,-50.87 -4.47333,-32.97333 -4.82,-93.48 1.96,-45.94 37.47,-128.29 2.24,-3.3 7.12,-9.46 4.15,-5.26 5.77,-16.87 -0.93333,-32.91333 -2.11,-97.03 -0.33333,-1.32 -1.73,-3.52 -2.11,-2.64 -6.7,-7.55 -2.83333,-4.43333 -6.27,-14.48 z';

// ─── Anillo de medición — estilo primera versión ────────────────────────────────
// Escala: viewBox male=724, female=734 → equivale a 200 de la v1 × factor 3.6
function MeasureRing({
  id, cx, cy, rx, ry, active, onPress, label, labelSide, value,
}: {
  id: string; cx: number; cy: number; rx: number; ry: number;
  active: boolean; onPress: (id: string) => void;
  label: string; labelSide: 'left' | 'right'; value?: number;
}) {
  const F = 3.6; // factor escala respecto a primera versión (viewBox 200→724)
  const ringColor = active ? '#10b981' : '#dc2626';
  const dotColor  = active ? '#10b981' : '#1e40af';
  const textColor = active ? '#059669' : '#374151';

  const dotX = labelSide === 'left' ? cx - rx : cx + rx;
  // línea va hasta el label box
  const lineLen  = 40 * F;
  const lineEndX = labelSide === 'left'
    ? dotX - lineLen
    : dotX + lineLen;

  const boxW  = 46 * F;
  const boxH  = active && value ? 22 * F : 18 * F;
  const boxX  = labelSide === 'left' ? lineEndX - boxW : lineEndX;
  const boxY  = cy - boxH / 2;
  const textX = boxX + boxW / 2;

  return (
    <g onClick={() => onPress(id)} className="cursor-pointer" style={{ userSelect: 'none' }}>
      {/* anillo */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill="none" stroke={ringColor}
        strokeWidth={active ? 2 * F : 1.4 * F} opacity={0.85} />

      {/* pulso activo */}
      {active && (
        <circle cx={dotX} cy={cy} r={7 * F} fill={dotColor} opacity={0.18} />
      )}

      {/* punto */}
      <circle cx={dotX} cy={cy} r={active ? 4.5 * F : 3.5 * F} fill={dotColor} />
      <circle cx={dotX} cy={cy} r={2 * F} fill="white" />

      {/* línea */}
      <line
        x1={dotX + (labelSide === 'left' ? -3 * F : 3 * F)} y1={cy}
        x2={lineEndX} y2={cy}
        stroke={ringColor} strokeWidth={0.9 * F}
      />

      {/* caja label */}
      <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={4 * F}
        fill={active ? '#ecfdf5' : '#f8f9fa'}
        stroke={active ? '#10b981' : '#d1d5db'}
        strokeWidth={0.8 * F}
      />
      <text x={textX} y={cy - 1 * F}
        fontSize={6.5 * F} textAnchor="middle"
        fill={textColor} fontWeight="500">
        {label}
      </text>
      {active && value && (
        <text x={textX} y={cy + 7 * F}
          fontSize={6 * F} textAnchor="middle"
          fill="#059669">
          {value} cm
        </text>
      )}
    </g>
  );
}

// ─── Silueta masculina ─────────────────────────────────────────────────────────
function MaleSilhouette({ active, onPoint, record }: {
  active: string | null; onPoint: (id: string) => void;
  record: BodyMeasurementRecord | null;
}) {
  return (
    <svg viewBox="0 0 724 1448" className="w-full h-full">
      <path d={MALE_BODY} fill="#f0ede8" stroke="#8c837a" strokeWidth="3"
        strokeLinejoin="round" strokeLinecap="round" />

      <MeasureRing id="chest"    cx={362} cy={395}  rx={155} ry={27} label="Pecho"     labelSide="right" active={active==='chest'}    onPress={onPoint} value={record?.chest} />
      <MeasureRing id="waist"    cx={362} cy={535}  rx={120} ry={21} label="Cintura"   labelSide="right" active={active==='waist'}    onPress={onPoint} value={record?.waist} />
      <MeasureRing id="hips"     cx={362} cy={660}  rx={138} ry={25} label="Cadera"    labelSide="right" active={active==='hips'}     onPress={onPoint} value={record?.hips} />
      <MeasureRing id="glutes"   cx={362} cy={700}  rx={142} ry={25} label="Glúteo"   labelSide="left"  active={active==='glutes'}   onPress={onPoint} value={record?.glutes} />
      <MeasureRing id="arms"     cx={140} cy={478}  rx={40}  ry={19} label="Brazo"     labelSide="left"  active={active==='arms'}     onPress={onPoint} value={record?.arms} />
      <MeasureRing id="forearms" cx={118} cy={638}  rx={34}  ry={16} label="Antebrazo" labelSide="left"  active={active==='forearms'} onPress={onPoint} value={record?.forearms} />
      <MeasureRing id="thighs"   cx={258} cy={878}  rx={82}  ry={21} label="Muslo"     labelSide="left"  active={active==='thighs'}   onPress={onPoint} value={record?.thighs} />
      <MeasureRing id="calves"   cx={262} cy={1108} rx={56}  ry={17} label="Gemelo"    labelSide="left"  active={active==='calves'}   onPress={onPoint} value={record?.calves} />
    </svg>
  );
}

// ─── Silueta femenina ──────────────────────────────────────────────────────────
function FemaleSilhouette({ active, onPoint, record }: {
  active: string | null; onPoint: (id: string) => void;
  record: BodyMeasurementRecord | null;
}) {
  return (
    <svg viewBox="-50 -40 734 1538" className="w-full h-full">
      <path d={FEMALE_BODY} fill="#f0ede8" stroke="#8c837a" strokeWidth="3"
        strokeLinejoin="round" strokeLinecap="round" />

      <MeasureRing id="chest"    cx={317} cy={390}  rx={148} ry={25} label="Pecho"     labelSide="right" active={active==='chest'}    onPress={onPoint} value={record?.chest} />
      <MeasureRing id="waist"    cx={317} cy={570}  rx={95}  ry={19} label="Cintura"   labelSide="right" active={active==='waist'}    onPress={onPoint} value={record?.waist} />
      <MeasureRing id="hips"     cx={317} cy={750}  rx={160} ry={27} label="Cadera"    labelSide="right" active={active==='hips'}     onPress={onPoint} value={record?.hips} />
      <MeasureRing id="glutes"   cx={317} cy={795}  rx={162} ry={27} label="Glúteo"   labelSide="left"  active={active==='glutes'}   onPress={onPoint} value={record?.glutes} />
      <MeasureRing id="arms"     cx={96}  cy={474}  rx={36}  ry={17} label="Brazo"     labelSide="left"  active={active==='arms'}     onPress={onPoint} value={record?.arms} />
      <MeasureRing id="forearms" cx={78}  cy={646}  rx={30}  ry={14} label="Antebrazo" labelSide="left"  active={active==='forearms'} onPress={onPoint} value={record?.forearms} />
      <MeasureRing id="thighs"   cx={220} cy={958}  rx={80}  ry={21} label="Muslo"     labelSide="left"  active={active==='thighs'}   onPress={onPoint} value={record?.thighs} />
      <MeasureRing id="calves"   cx={225} cy={1193} rx={54}  ry={16} label="Gemelo"    labelSide="left"  active={active==='calves'}   onPress={onPoint} value={record?.calves} />
    </svg>
  );
}

// ─── Campos ────────────────────────────────────────────────────────────────────
const FIELDS = [
  { id: 'weight',   label: 'Peso',      unit: 'kg' },
  { id: 'chest',    label: 'Pecho',     unit: 'cm' },
  { id: 'waist',    label: 'Cintura',   unit: 'cm' },
  { id: 'hips',     label: 'Cadera',    unit: 'cm' },
  { id: 'glutes',   label: 'Glúteo',   unit: 'cm' },
  { id: 'arms',     label: 'Brazo',     unit: 'cm' },
  { id: 'forearms', label: 'Antebrazo', unit: 'cm' },
  { id: 'thighs',   label: 'Muslo',     unit: 'cm' },
  { id: 'calves',   label: 'Gemelo',    unit: 'cm' },
] as const;

type FieldId = typeof FIELDS[number]['id'];

interface MetricsModalProps {
  gender: 'male' | 'female';
  currentWeight: number;
  lastRecord: BodyMeasurementRecord | null;
  history?: BodyMeasurementRecord[];
  onSave: (data: { weight?: number; record: BodyMeasurementRecord }) => void;
  onClose: () => void;
}

export function MetricsModal({ gender, currentWeight, lastRecord, history = [], onSave, onClose }: MetricsModalProps) {
  const [tab, setTab]                 = useState<'register' | 'evolution'>('register');
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const [showInputs, setShowInputs]   = useState(false);
  const [saved, setSaved]             = useState(false);

  // Historial ordenado cronológicamente (antiguo → reciente) para gráficas
  const chrono = useMemo(
    () => [...history].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    [history]
  );

  // Serie de peso para la gráfica
  const weightSeries = useMemo(
    () => chrono
      .filter(r => r.weight != null)
      .map(r => ({ date: new Date(r.recordedAt).toISOString().slice(0, 10), value: r.weight! })),
    [chrono]
  );

  // Tendencia de cada medida: primer y último valor no nulo
  const trends = useMemo(() => {
    return FIELDS.map(f => {
      const series = chrono
        .map(r => f.id === 'weight' ? r.weight : (r as unknown as Record<string, number | undefined>)[f.id])
        .filter((v): v is number => v != null);
      if (series.length === 0) return { ...f, current: undefined, delta: null, count: 0 };
      const current = series[series.length - 1];
      const first = series[0];
      const delta = series.length >= 2 ? current - first : null;
      return { ...f, current, delta, count: series.length };
    });
  }, [chrono]);

  const hasEvolutionData = history.length >= 1;
  const [draft, setDraft]             = useState<Record<FieldId, string>>({
    weight:   currentWeight?.toString() ?? '',
    chest:    lastRecord?.chest?.toString()    ?? '',
    waist:    lastRecord?.waist?.toString()    ?? '',
    hips:     lastRecord?.hips?.toString()     ?? '',
    glutes:   lastRecord?.glutes?.toString()   ?? '',
    arms:     lastRecord?.arms?.toString()     ?? '',
    forearms: lastRecord?.forearms?.toString() ?? '',
    thighs:   lastRecord?.thighs?.toString()   ?? '',
    calves:   lastRecord?.calves?.toString()   ?? '',
  });

  const handlePoint = (id: string) => {
    setActivePoint(id === activePoint ? null : id);
    setShowInputs(true);
    setTimeout(() => document.getElementById(`m-${id}`)?.focus(), 150);
  };

  const handleSave = () => {
    const record: BodyMeasurementRecord = {
      chest:    draft.chest    ? parseFloat(draft.chest)    : undefined,
      waist:    draft.waist    ? parseFloat(draft.waist)    : undefined,
      hips:     draft.hips     ? parseFloat(draft.hips)     : undefined,
      glutes:   draft.glutes   ? parseFloat(draft.glutes)   : undefined,
      arms:     draft.arms     ? parseFloat(draft.arms)     : undefined,
      forearms: draft.forearms ? parseFloat(draft.forearms) : undefined,
      thighs:   draft.thighs   ? parseFloat(draft.thighs)   : undefined,
      calves:   draft.calves   ? parseFloat(draft.calves)   : undefined,
      recordedAt: new Date(),
    };
    onSave({ weight: draft.weight ? parseFloat(draft.weight) : undefined, record });
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="glass-modal w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[94vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Métricas corporales</h2>
            <p className="text-stone-400 text-xs mt-0.5">
              {lastRecord
                ? `Última vez: ${new Date(lastRecord.recordedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
                : 'Sin registros previos'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 transition-colors">
            <X className="w-5 h-5 text-stone-600 dark:text-white/70" />
          </button>
        </div>

        {/* Tabs Registrar / Evolución */}
        <div className="px-6 pb-3 flex-shrink-0">
          <div className="flex gap-1 p-1 rounded-2xl bg-stone-100 dark:bg-white/8">
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                tab === 'register' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 dark:text-white/50'
              }`}
            >
              Registrar
            </button>
            <button
              onClick={() => setTab('evolution')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                tab === 'evolution' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 dark:text-white/50'
              }`}
            >
              Evolución
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {tab === 'register' ? (
            <>
              <div className="flex items-center justify-center" style={{ height: 340 }}>
                {gender === 'female'
                  ? <FemaleSilhouette active={activePoint} onPoint={handlePoint} record={lastRecord} />
                  : <MaleSilhouette   active={activePoint} onPoint={handlePoint} record={lastRecord} />
                }
              </div>

              <p className="text-center text-stone-400 text-xs mb-3">
                Pulsa un anillo para seleccionar esa medida
              </p>

              <button onClick={() => setShowInputs(!showInputs)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-stone-50 dark:bg-white/8 hover:bg-stone-100 transition-colors mb-3">
                <span className="text-stone-700 dark:text-white/80 font-medium text-sm">
                  {showInputs ? 'Ocultar campos' : 'Introducir medidas'}
                </span>
                {showInputs ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </button>

              <AnimatePresence>
                {showInputs && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {FIELDS.map(f => {
                        const isActive = activePoint === f.id;
                        const prev = f.id === 'weight' ? currentWeight : (lastRecord as Record<string,unknown> | null)?.[f.id];
                        return (
                          <div key={f.id}
                            className={`rounded-2xl border p-3 cursor-pointer transition-all ${
                              isActive ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 shadow-sm' : 'border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-stone-300'
                            }`}
                            onClick={() => f.id !== 'weight' && setActivePoint(f.id)}>
                            <label className={`text-xs font-medium block mb-1 cursor-pointer ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-white/50'}`}>
                              {f.label}
                            </label>
                            <div className="flex items-end gap-0.5">
                              <Input id={`m-${f.id}`} type="number"
                                value={draft[f.id]}
                                onChange={e => setDraft(d => ({ ...d, [f.id]: e.target.value }))}
                                onFocus={() => f.id !== 'weight' && setActivePoint(f.id)}
                                placeholder={prev?.toString() ?? '—'}
                                className={`flex-1 h-8 px-0 border-0 bg-transparent focus:ring-0 text-sm font-bold shadow-none ${
                                  isActive ? 'text-emerald-800 dark:text-emerald-300 placeholder:text-emerald-300' : 'text-stone-800 dark:text-white placeholder:text-stone-300'
                                }`} />
                              <span className={`text-xs pb-0.5 ${isActive ? 'text-emerald-500' : 'text-stone-400'}`}>{f.unit}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.div key="ok" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 py-4 bg-emerald-50 dark:bg-emerald-500/15 rounded-2xl text-emerald-700 dark:text-emerald-400">
                    <Check className="w-5 h-5" /><span className="font-semibold">¡Guardado!</span>
                  </motion.div>
                ) : (
                  <motion.div key="btn">
                    <Button onClick={handleSave}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-semibold text-base shadow-lg shadow-emerald-100">
                      Guardar métricas
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* ── Pestaña Evolución ── */
            <div className="space-y-4">
              {!hasEvolutionData ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-10 h-10 text-stone-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-stone-500 dark:text-white/60 text-sm font-medium">Aún no hay registros</p>
                  <p className="text-stone-400 text-xs mt-1">Guarda tus medidas para ver tu evolución aquí</p>
                </div>
              ) : (
                <>
                  {/* Gráfica de peso */}
                  <div className="rounded-2xl bg-stone-50 dark:bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-stone-800 dark:text-white">Peso</p>
                      <span className="text-xs text-stone-400">{weightSeries.length} registros</span>
                    </div>
                    {weightSeries.length >= 2 ? (
                      <LineChart data={weightSeries} unit=" kg" color="#10b981" height={150} />
                    ) : (
                      <p className="text-stone-400 text-xs py-6 text-center">Necesitas al menos 2 registros de peso para ver la gráfica</p>
                    )}
                  </div>

                  {/* Tendencias por medida */}
                  <div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-white mb-2 px-1">Tendencias</p>
                    <div className="space-y-1.5">
                      {trends.filter(t => t.count > 0).map(t => {
                        const up = t.delta != null && t.delta > 0;
                        const down = t.delta != null && t.delta < 0;
                        return (
                          <div key={t.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white dark:bg-white/5 border border-stone-100 dark:border-white/8">
                            <span className="text-sm text-stone-600 dark:text-white/70">{t.label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-stone-900 dark:text-white">
                                {t.current}<span className="text-xs font-normal text-stone-400 ml-0.5">{t.unit}</span>
                              </span>
                              {t.delta != null && (
                                <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                                  up ? 'text-orange-600 bg-orange-50 dark:bg-orange-500/15'
                                  : down ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15'
                                  : 'text-stone-500 bg-stone-100 dark:bg-white/8'
                                }`}>
                                  {up ? <TrendingUp className="w-3 h-3" /> : down ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                  {t.delta > 0 ? '+' : ''}{t.delta.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Historial de registros */}
                  <div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-white mb-2 px-1">Historial</p>
                    <div className="space-y-1.5">
                      {[...chrono].reverse().slice(0, 8).map((r, i) => (
                        <div key={r.id ?? i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-stone-50 dark:bg-white/5">
                          <span className="text-xs text-stone-500 dark:text-white/60">
                            {new Date(r.recordedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs font-semibold text-stone-700 dark:text-white/80">
                            {r.weight != null ? `${r.weight} kg` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
