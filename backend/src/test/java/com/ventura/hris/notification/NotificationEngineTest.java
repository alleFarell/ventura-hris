package com.ventura.hris.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.notification.dto.UpdateTemplateRequest;
import com.ventura.hris.notification.entity.Notification;
import com.ventura.hris.notification.entity.NotificationTemplate;
import com.ventura.hris.notification.repository.NotificationTemplateRepository;
import com.ventura.hris.notification.service.NotificationService;
import com.ventura.hris.security.entity.User;
import com.ventura.hris.security.repository.UserRepository;
import com.ventura.hris.util.TestDatabaseCleaner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationEngineTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationTemplateRepository templateRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("testuser@ventura.test");
        testUser.setFullName("Test User");
        testUser.setPasswordHash("hashed_pwd");
        testUser.setStatus("ACTIVE");
        testUser = userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldCreateRetrieveAndMarkNotificationsAsRead() throws Exception {
        // 1. Create two notifications
        Notification n1 = notificationService.createNotification(
                testUser.getId(),
                "Task Assigned",
                "You have been assigned an onboarding task.",
                "WORKFLOW"
        );
        Notification n2 = notificationService.createNotification(
                testUser.getId(),
                "Document Approved",
                "Your document was approved by HR.",
                "EMPLOYEE"
        );

        // 2. Check unread count -> 2
        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.unreadCount", is(2)));

        // 3. Mark n1 as read
        mockMvc.perform(put("/api/v1/notifications/" + n1.getId() + "/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 4. Check unread count -> 1
        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount", is(1)));

        // 5. Mark all as read
        mockMvc.perform(put("/api/v1/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 6. Check unread count -> 0
        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount", is(0)));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldListAndUpdateNotificationTemplates() throws Exception {
        NotificationTemplate tmpl = templateRepository.findByTemplateCodeIgnoreCase("WELCOME_USER")
                .orElseGet(() -> templateRepository.save(new NotificationTemplate(
                        "WELCOME_USER",
                        "Welcome New User",
                        "IN_APP",
                        "Welcome to Ventura HRIS",
                        "Hello {{name}}"
                )));

        // 1. List templates
        mockMvc.perform(get("/api/v1/notification-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 2. Update template
        UpdateTemplateRequest updateReq = new UpdateTemplateRequest(
                "Welcome Updated",
                "EMAIL",
                "Welcome to Ventura Platform",
                "Dear {{name}}, your account is ready."
        );

        mockMvc.perform(put("/api/v1/notification-templates/" + tmpl.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Welcome Updated")))
                .andExpect(jsonPath("$.data.channel", is("EMAIL")));
    }
}
