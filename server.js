const express=require('express');
const axios = require('axios');
const _ = require('lodash');
const app= express();
const PORT=9000;

const memoizedStat= _.memoize(async(req,res)=>{
    const blogResponse = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
        },
      });
      const blogs = blogResponse.data.blogs;

    //  console.log(blogs)
      const totalBlogs = blogs.length;
      if(!totalBlogs){
        return {error:"Something went wrong while fetching totaol number of blogs"};
      }
      const longestTitleBlog = _.maxBy(blogs, 'title.length');
      if(!longestTitleBlog){
        return {error:"Something wrong to calculate longestTitkeBlog"};
       }
      const longestTitle=longestTitleBlog.title
     // console.log(longestTitle);
      const privacyBlogs = _.filter(blogs, (blog) => blog.title.toLowerCase().includes('privacy'));

        if(!privacyBlogs){
        return {error:'something went wrong while fetching blogs containing privacy'};
      }
      const TotalPrivacyBlogs= privacyBlogs.length;
     // console.log(TotalPrivacyBlogs)

      const uniqueTitles = _.uniqBy(blogs, 'title').map((blog) => blog.title);
      if(!uniqueTitles){
         return {error:"error while fetchinh unique blogs"};
        
      }
      //console.log(uniqueTitles)
     return {
        totalBlogs,
        longestTitle,
        TotalPrivacyBlogs,
        uniqueTitles
      }

      
},undefined,300000)


const memoizeSearch=_.memoize(async (query)=>{
   
    const blogResponse = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
        },
      });
      const blogs = blogResponse.data.blogs;
        if (!query) {
            return { error: 'Search query is required.' };
        }
        const searchResults = blogs.filter((blog) =>
            blog.title.toLowerCase().includes(query.toLowerCase())
        );
        if(!searchResults){
            return {error:"Nothing is found for this query params"};
        }

       return searchResults;

},undefined,300000);

app.get("/api/blog-stat",async(req,res)=>{
    try{

        const result=await memoizedStat();
        res.status(201).json({result})
    }catch(err){
        res.status(400).send({error:"cannot get data.There is some issue in loading the publuc api data"});
    }
})

app.get("/api/blog-search",async (req,res)=>{
    try{
        const query =req.query.query; 
        const result = await memoizeSearch(query);
        res.status(201).json({result});

    }catch(err){
        res.status(400).send({error:"Cannot perform search operation due to some issue"});
    }
})

app.get("/",(req,res)=>{
    res.send("Hello World!");
})

app.listen(PORT,()=>{
    console.log("Server is up and running on port 9000");
})


