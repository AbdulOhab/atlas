---
title: "Spring Boot"
order: 12
summary: "Java backends with Spring Boot 3: project setup, dependency injection, REST controllers, configuration and profiles, Spring Data JPA, validation, error handling, security, testing and production."
category: "Spring Boot"
level: Intermediate
---

# Spring Boot

Spring Boot is the standard way to build Java backends: it takes the Spring Framework and adds sensible defaults, an embedded web server and auto-configuration, so a working service is a few classes away. This module covers Spring Boot 3 with Java 17 or newer.

> **Note:** The Spring Getting Started guides are licensed CC BY-ND, which doesn't allow adapted versions, so this module is written for Atlas CE from scratch. Each topic links to the matching page of the [official reference](https://docs.spring.io/spring-boot/).

## Creating a Project

> **Official docs:** [Developing Your First Application](https://docs.spring.io/spring-boot/tutorial/first-application/index.html), [Spring Initializr](https://start.spring.io)

Start from [start.spring.io](https://start.spring.io): pick Maven or Gradle, Java 17+, and the dependencies **Spring Web**, **Spring Data JPA**, **Validation** and a database driver such as **PostgreSQL** or **H2**. It generates a project with this shape:

```text
demo/
├── pom.xml                       # dependencies and build
├── mvnw, mvnw.cmd                # Maven wrapper: no local Maven needed
└── src/
    ├── main/java/com/example/demo/DemoApplication.java
    ├── main/resources/application.properties
    └── test/java/com/example/demo/DemoApplicationTests.java
```

The entry point is one annotated class:

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

`@SpringBootApplication` turns on three things: component scanning of this package and below, auto-configuration based on what's on the classpath, and Java-based configuration. Run it with:

```bash
./mvnw spring-boot:run        # or ./gradlew bootRun
```

An embedded Tomcat starts on port 8080. Keep every other class in packages **under** the main class's package, or component scanning won't find them.

## Dependency Injection

> **Official docs:** [Spring Beans and Dependency Injection](https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html)

Spring creates your objects (called **beans**) and wires them together. You mark classes as components and declare what they need in the constructor:

```java
@Repository
public class InMemoryBookRepository {
    private final Map<Long, Book> books = new ConcurrentHashMap<>();
    // …
}

@Service
public class BookService {
    private final InMemoryBookRepository repository;

    // One constructor: Spring passes in the bean it needs. No @Autowired required.
    public BookService(InMemoryBookRepository repository) {
        this.repository = repository;
    }
}
```

The stereotype annotations are all components; the name documents the role:

| Annotation | Used for |
| --- | --- |
| `@Component` | any bean |
| `@Service` | business logic |
| `@Repository` | data access (also translates database exceptions) |
| `@Controller` / `@RestController` | web endpoints |
| `@Configuration` + `@Bean` | beans you build yourself, e.g. a third-party client |

Prefer constructor injection with `final` fields over `@Autowired` on fields: dependencies are explicit, the class can't exist half-built, and tests can construct it with plain `new`.

## REST Controllers

> **Official docs:** [Spring MVC](https://docs.spring.io/spring-boot/reference/web/servlet.html)

A `@RestController` maps HTTP requests to methods and turns return values into JSON:

```java
@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping
    public List<BookResponse> list(@RequestParam(defaultValue = "0") int page) {
        return service.list(page);
    }

    @GetMapping("/{id}")
    public BookResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse create(@Valid @RequestBody CreateBookRequest request) {
        return service.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
```

Request and response bodies are best written as Java **records**: immutable, concise, and serialized by Jackson out of the box.

```java
public record CreateBookRequest(@NotBlank String title, @NotBlank String author, @Positive int pages) {}
public record BookResponse(Long id, String title, String author) {}
```

When you need control over headers or the status at runtime, return `ResponseEntity<T>`, e.g. `ResponseEntity.created(location).body(book)`.

## Configuration and Profiles

> **Official docs:** [Externalized Configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html), [Profiles](https://docs.spring.io/spring-boot/reference/features/profiles.html)

Settings live in `application.properties` (or `application.yml`) and can be overridden by environment variables or command-line arguments, so the same jar runs everywhere:

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/books
spring.datasource.username=books
spring.datasource.password=${DB_PASSWORD}
app.catalog.page-size=20
```

Environment variables map automatically: `SPRING_DATASOURCE_URL` overrides `spring.datasource.url`.

Bind your own settings to a typed record instead of scattering `@Value` strings:

```java
@ConfigurationProperties(prefix = "app.catalog")
public record CatalogProperties(int pageSize) {}

@SpringBootApplication
@ConfigurationPropertiesScan
public class DemoApplication { /* … */ }
```

**Profiles** switch configuration per environment. `application-dev.properties` and `application-prod.properties` are layered on top of the base file when the profile is active:

```bash
SPRING_PROFILES_ACTIVE=prod java -jar app.jar
```

Never commit secrets: reference them as `${DB_PASSWORD}` and supply them from the environment or a secret manager.

## Data Access with Spring Data JPA

> **Official docs:** [SQL Databases](https://docs.spring.io/spring-boot/reference/data/sql.html), [Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/)

JPA maps Java classes to tables; Spring Data writes the repository implementation for you.

```java
@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private int pages;

    protected Book() {}                       // JPA needs a no-arg constructor

    public Book(String title, String author, int pages) {
        this.title = title;
        this.author = author;
        this.pages = pages;
    }
    // getters …
}
```

```java
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByAuthorIgnoreCase(String author);           // query derived from the name

    @Query("select b from Book b where b.pages > :min order by b.pages desc")
    List<Book> findLongBooks(@Param("min") int min);
}
```

`JpaRepository` already provides `save`, `findById`, `findAll(Pageable)`, `deleteById` and more. Put `@Transactional` on service methods that change data, so all their writes commit or roll back together.

Manage the schema with a migration tool such as **Flyway** (`src/main/resources/db/migration/V1__create_books.sql`) rather than `spring.jpa.hibernate.ddl-auto=update`, which is fine for experiments but unsafe in production.

## Validation

> **Official docs:** [Validation](https://docs.spring.io/spring-boot/reference/io/validation.html)

With the Validation starter, Jakarta Bean Validation annotations describe what valid input looks like, and `@Valid` enforces them before your method runs:

```java
public record CreateBookRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String author,
        @Positive @Max(10_000) int pages,
        @Email String contactEmail) {}
```

```java
@PostMapping
public BookResponse create(@Valid @RequestBody CreateBookRequest request) { … }
```

An invalid request never reaches the method: Spring responds with `400 Bad Request` and the list of failed fields. Common constraints are `@NotNull`, `@NotBlank`, `@Size`, `@Min`/`@Max`, `@Positive`, `@Email`, `@Pattern` and `@Past`/`@Future`.

Validation at the edge checks shape; business rules ("the author must exist", "a member can borrow at most 5 books") belong in the service.

## Error Handling

> **Official docs:** [Error Handling](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.spring-mvc.error-handling)

Throw meaningful exceptions in services and translate them to HTTP responses in one place with `@RestControllerAdvice`:

```java
public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(Long id) {
        super("Book " + id + " not found");
    }
}

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(BookNotFoundException.class)
    public ProblemDetail notFound(BookNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail invalid(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setDetail("Validation failed");
        problem.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList());
        return problem;
    }
}
```

`ProblemDetail` produces the standard RFC 9457 error format (`type`, `title`, `status`, `detail`), so clients get the same error shape from every endpoint. Setting `spring.mvc.problemdetails.enabled=true` makes Spring's own errors use it too. Never return stack traces to clients.

## Security

> **Official docs:** [Spring Security](https://docs.spring.io/spring-boot/reference/web/spring-security.html)

Adding the Spring Security starter locks every endpoint by default. You then describe what's open and how users authenticate with a `SecurityFilterChain` bean:

```java
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))  // validate JWTs
                .csrf(csrf -> csrf.disable())          // stateless token API, no browser session
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
}
```

With `spring.security.oauth2.resourceserver.jwt.issuer-uri` set, Spring fetches the issuer's keys and validates every token's signature and expiry. Keep CSRF protection **on** for apps that use browser cookies and sessions; disabling it is only right for stateless token APIs. Store passwords with `PasswordEncoder` (BCrypt by default), never in plain text.

## Testing

> **Official docs:** [Testing](https://docs.spring.io/spring-boot/reference/testing/index.html)

The test starter brings JUnit 5, AssertJ, Mockito and Spring's test support. Choose the narrowest test that covers what you're checking.

A **web slice** test loads only the MVC layer and fakes the service:

```java
@WebMvcTest(BookController.class)
class BookControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean BookService service;

    @Test
    void returns404ForMissingBook() throws Exception {
        when(service.get(99L)).thenThrow(new BookNotFoundException(99L));

        mvc.perform(get("/api/books/99"))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.detail").value("Book 99 not found"));
    }
}
```

A **data slice** test (`@DataJpaTest`) checks repositories against a real database; Testcontainers starts a throwaway PostgreSQL in Docker so tests match production. A full `@SpringBootTest` starts the whole app for end-to-end checks; use it sparingly, since it's the slowest.

Plain services need no Spring at all: construct them with `new` and mocked dependencies.

## Running in Production

> **Official docs:** [Actuator](https://docs.spring.io/spring-boot/reference/actuator/index.html), [Packaging for Production](https://docs.spring.io/spring-boot/reference/packaging/index.html)

Build a single executable jar and run it anywhere Java is installed:

```bash
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

Or build a container image without writing a Dockerfile:

```bash
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=acme/books
```

Add **Spring Boot Actuator** for operational endpoints:

```properties
management.endpoints.web.exposure.include=health,info,prometheus
management.endpoint.health.probes.enabled=true
```

That exposes `/actuator/health` (with Kubernetes liveness and readiness groups) and metrics for Prometheus through Micrometer. Expose only what you need and keep the rest behind authentication.

A production checklist: configuration and secrets from the environment, schema changes through Flyway, `server.shutdown=graceful` so in-flight requests finish during deploys, structured logs to stdout, and health probes wired to your orchestrator. The DevOps track's [Kubernetes](/devops/kubernetes) and [Observability](/devops/observability) modules cover the platform side.
