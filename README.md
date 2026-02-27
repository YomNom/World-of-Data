# WORLD OF DATA
This website displays 5 interactible visuals comparing two databases sourced from Our World in Data https://ourworldindata.org/search.
The two databases that are visualized were [Self-Reported Life Satisfaction](https://ourworldindata.org/grapher/happiness-cantril-ladder?tab=discrete-bar&time=latest&country=OWID_WRL~OWID_EUR~OWID_ASI~OWID_AFR) and [Share of Population Living in Extreme Poverty](https://ourworldindata.org/grapher/share-of-population-in-extreme-poverty?tab=table&time=latest&country=MOZ~ZMB~KEN~NGA). My focus was self-reported life satisfaction because I wanted to see how something in life would correlate to someone's measurement of their own happiness. There was a lot to choose from but I selected poverty because finance is a significant part of living and a strong variable in possibly impacting a person's life. The visualizations on this website represent that impact.  

https://github.com/user-attachments/assets/25c8cff8-ea1b-4c2b-b311-2b440ba4a322

## DATA

### [Self-Reported Life Satisfaction](https://ourworldindata.org/grapher/happiness-cantril-ladder?tab=discrete-bar&time=latest&country=OWID_WRL~OWID_EUR~OWID_ASI~OWID_AFR)

This dataset only has three fields: Entity(Country Name), Code (Country Code), Year collected, and Self-Reported Life Satisfaction. Self-Reported Life Satisfaction was the average of survey responses from the country that responders answered with a number from 0 to 10. 0 Being the worst and 10 being the best. This data was collected from years 2011 to 2024.

### [Share of Population Living in Extreme Poverty](https://ourworldindata.org/grapher/share-of-population-in-extreme-poverty?tab=table&time=latest&country=MOZ~ZMB~KEN~NGA)

The data collected for this database defined extreme poverty as living below the International Poverty Line of $3 per day. The data is adjusted for inflation and differences in living costs between countries. "The 'International Poverty Line' plays an important and successful role in focusing the world's attention on the very poorest people. The UN uses this indicator to track progress towards ending extreme poverty by 2030." This data was colled from years 1963 to 2024. The data field representing the share of population is in percentage and refers either to income (after taxes and benefits) or to consumption, per capita. Besides that field, country name, year, and code, the database has field holding the country's population. 

This data was processed due the years having abnormal values, such as -100. Countries with no data were later deducted in an attempt to fix the choropleth bug where majority of the data was missing.

## Layout

I did not want all the graphs on one page for this challenge because I didn't want to user to scroll in any way. I did not know how to accomodate for screen size. I got the idea to use javascript to adjust the html from other projects I did. I was very confident that I had done this before. I'm not so confident anymore but I did it in someway. In another project, I used a variable to indicate what to show, but that's not possible to use if else statements in html. In any case, I aimed for a standard layout with a header, navigation buttons, and body.

<img width="379" height="354" alt="image" src="https://github.com/user-attachments/assets/0901522a-1dc3-40c5-a65b-0eab26a2745a" />

## Visualization Components

This website is all on one page. Although it might not look that way with buttons changing the graphs, the buttons are making graphs invisible and visible simulating multiple pages. Poverty is colored red because the color often signifies something negative. Self-Satisfaction was colored yellow to match yellow smily faces. 

There are three views: Bar Chart + Scatter, Line Chart, and Choropleth Map. 

### Bar Chart + Scatter

This page details focuses on the databases separately. There are two barcharts that show each databases stat on each country. Poverty's barchart was connected to line graph to compare population and poverty so users could see how it was related to the poverty rate. Users can see further details by hovering their mouse over the bars. 

https://github.com/user-attachments/assets/680506f5-8b6c-45a6-bd8b-c33e4b4dbe4f

### Line Chart

The line chart directly compares the two databases with their averages. You can interact with the graph by selecting where to focus on with the smaller graph below it. This was also to look more closely at self-satisfication because of how little it changed. 

https://github.com/user-attachments/assets/31fde5e9-d8c2-47a0-ae78-1df88bdefe69

### Choropleth Map

The choropleth maps are a bit bugged. This was set as the default because when moving from Bar Chart + Scatter the tooltip details don't show up due to not loading fast enough. There's also a discrepency between the geodata and country names in the csv files so a lot of data is missing in the representation. There are two buttons that switch between the datasets. Self-Satisfaction is up by default and labeled happiness. 

https://github.com/user-attachments/assets/d808bb93-85d8-4426-85ca-ef13c0da0c7a

## Findings

Self-reported life satisfaction was relatively consistent over time for each country. I compared the average data per year in a line graph. The data for poverty was put onto a 0 to 10 scale to match self-satisfaction. The average self-reported satisfaction only increased and decreased by hundredths decimal place, making it hard to judge by eye. The lowest it went was 5.37 and poverty was 3.37. At poverty's lowest point, .86, self-satisfaction was 5.53. 

<img width="848" height="423" alt="image" src="https://github.com/user-attachments/assets/de330833-5d8c-48b1-bb5b-498003b32479" />

Although it is not showing properly, populations in Africa have a hotspot for low satisfaction and poverty. Everywhere else is pretty similar. 

## Libraries

The javascript framework D3 was used to depict the graphs. Pandas was used to process the data (db_process.py)

## Challenges and Future Work

With my set-up, the difficult spots were reading or writing large representations. Any delays in rewriting graphs caused visual bugs, specfically in tooltips. If I had more time on this I would create a filter accessible in the header that would control the data shown. This is was not unexpected when I implemented this. I just did not want to go through the process of setting up other pages. 

My biggest bug - which I was not able to find where the issue was until after I submitted this - was why the choropleth graphs seemed to be missing so much data and why the amount was so different between the two databases. I thought it was how I merged my data, how I processed it, or the geodata I was using. I do want to go fix it in the future but I found from someone else that it was the country names being different between the geodata and csvs, which did not occur to me to look for since poverty's choropleths was missing so much data. That person's only missing data was the USA so they were able to pinpoint the issue.

This experience wouldn't impact how I would set up the navigation but if I were to do this website specifically again I would emphasize not showing everything all at once. 

## Collaboration & AI Use
I used Github's built-in ai to debug. It was a quick way to find where I didn't change a variable and pointing to where or what the issue was. 

I have a bug in the choropleth graphs where data from not all the countries were showing up properly. Someone I presented to pointed out to me that the issue was country naming was different between the geodata and the csv. I have yet to implement a patch but it is concerning how the data missing between the two db are wildly different.
