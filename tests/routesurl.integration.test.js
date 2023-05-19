const request = require('supertest');
const { app } = require('../app');
const randomEmail = require('random-email');

describe('Hello', () => {
    it('When user tries to signup it will return object', async () => {
        const user = {
            name: "Sagar Mishra",
            email: randomEmail(),
            password: '12345678'
        }
        const response = await request(app).post("/users/reg").send(user);
        expect(response.body).toEqual(
            expect.objectContaining({
                status: expect.any(String),
                hint: expect.any(String),
                token: expect.any(String)
            })
        )
        expect(response.statusCode).toBe(201);
    })
    it('when user tried to sign up with existing email', async () => {
        const user = {
            name: "Sagar Mishra",
            email: "sagar785mishra@gmail.com",
            password: "123456789"
        }
        const response = await request(app).post("/users/reg").send(user);
        expect(response.statusCode).toBe(404);
    })

    it('When user tries to login with registered email', async () => {
        const user = {
            name: "Sagar Mishra",
            email: "sagar785mishra@gmail.com",
            password: "123456789"
        }
        const response = await request(app).post("/users/login").send(user);
        expect(response.statusCode).toBe(201);
    })

    it('when user tries to login with non-registered email', async () => {
        const user = {
            name: "Sagar Mishra",
            email: "sagar786mishra@gmail.com",
            password: "123456789"
        }
        const response = await request(app).post("/users/login").send(user);
        expect(response.statusCode).toBe(404);
    })

    it('When user enters incorrect password', async () => {
        const user = {
            name: "Sagar Mishra",
            email: "sagar785mishra@gmail.com",
            password: "1234567"
        }
        const response = await request(app).post("/users/login").send(user);
        expect(response.statusCode).toBe(400);
    })
    it('When user tried to access post url enpoint using token', async ()=>{
        const user = {
            name: "Sagar Mishra",
            email: "sagar785mishra@gmail.com",
            password: "123456789"
        }
        const response = await request(app).post("/users/login").send(user);
        authToken= response.body.token;
        const url ={
            "url":"https://wwww.google.com"
        }
        const result = await request(app).post("/shorten").set('Authorization',`Bearer ${authToken}`).send(url);
        expect(result.body).toEqual(
            expect.objectContaining({
                urlCode : expect.any(String),
                longUrl : expect.any(String),
                shortUrl : expect.any(String),
            })
        )
    })

    it('when user tried to access post url endpoint using token and then access shortUrl',async ()=>{
        const user = {
            name: "Sagar Mishra",
            email: "sagar785mishra@gmail.com",
            password: "123456789"
        }
        const response = await request(app).post("/users/login").send(user);
        authToken= response.body.token;
        const url ={
            "url":"https://wwww.google.com"
        }
        const result = await request(app).post("/shorten").set('Authorization',`Bearer ${authToken}`).send(url);
        const id = result.body.urlCode;
        const get = await request(app).get(`/${id}`);
        expect(get.statusCode).toBe(301);
    })
})
