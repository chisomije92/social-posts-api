const hello = () => {
  return {
    Id: 1,
    text: "Hello World",
    views: 123.45,
  };
};

const resolvers: any = {
  hello,
};

export default resolvers;
